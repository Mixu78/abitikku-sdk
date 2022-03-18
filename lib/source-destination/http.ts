/*
 * Copyright 2018 balena.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import axios, {
	AxiosBasicCredentials,
	AxiosInstance,
	AxiosResponse,
} from 'axios';
// Always use the node adapter (even in a browser)
// @ts-ignore
import * as axiosNodeAdapter from 'axios/lib/adapters/http';
import { ReadResult } from 'file-disk';
import { basename } from 'path';
import { unescape } from 'querystring';
import { parse } from 'url';

import { StreamLimiter } from '../stream-limiter';
import { Metadata } from './metadata';
import {
	CreateReadStreamOptions,
	SourceDestination,
} from './source-destination';
import * as fs from "fs";
import {getLocalStorage} from "../utils";
import * as path from "path";


axios.defaults.adapter = axiosNodeAdapter;
export class Http extends SourceDestination {
	// Only implements reading for now
	private fileName: string | undefined;
	private url: string;
	private redirectUrl: string;
	// @ts-ignore
	private useCache: boolean;
	private avoidRandomAccess: boolean;
	private size: number | undefined;
	private acceptsRange: boolean;
	private ready: Promise<void>;
	private error: Error;
	private axiosInstance: AxiosInstance;

	constructor({
		url,
		useCache = false,
		avoidRandomAccess = false,
		axiosInstance = axios.create(),
		auth,
	}: {
		url: string;
		useCache?: boolean;
		avoidRandomAccess?: boolean;
		axiosInstance?: AxiosInstance;
		auth?: AxiosBasicCredentials;
	}) {
		super();
		this.url = url;
		this.useCache = useCache;
		this.avoidRandomAccess = avoidRandomAccess;
		this.axiosInstance = axiosInstance;
		if (auth) {
			this.axiosInstance.defaults.auth = auth;
		}
		this.ready = this.getInfo();
	}

	private async getInfo() {
		try {
			let response: AxiosResponse;
			try {
				response = await this.axiosInstance({ method: 'head', url: this.url });
			} catch (error) {
				// We use GET instead of HEAD as some servers will respond with a 403 to HEAD requests
				response = await this.axiosInstance({
					method: 'get',
					url: this.url,
					responseType: 'stream',
				});
				response.data.destroy();
			}
			this.redirectUrl = response.request.res.responseUrl;
			this.size = parseInt(response.headers['content-length'], 10);
			if (Number.isNaN(this.size)) {
				this.size = undefined;
			}
			const regExpFilename = /filename="(?<filename>.*)"/;
			this.fileName =
				regExpFilename.exec(response.headers['content-disposition'])?.groups
					?.filename ?? undefined;
			this.acceptsRange = response.headers['accept-ranges'] === 'bytes';
		} catch (error) {
			this.error = error;
		}
	}

	public async canRead(): Promise<boolean> {
		await this.ready;
		if (this.error) {
			throw this.error;
		}
		return !this.avoidRandomAccess && this.acceptsRange;
	}

	public async canCreateReadStream(): Promise<boolean> {
		return true;
	}

	protected async _getMetadata(): Promise<Metadata> {
		await this.ready;
		if (this.error) {
			throw this.error;
		}
		const pathname = parse(this.redirectUrl).pathname;
		if (!this.fileName && pathname !== undefined) {
			this.fileName = basename(unescape(pathname));
		}
		return {
			size: this.size,
			name: this.fileName,
		};
	}

	private getRange(start = 0, end?: number) {
		// start and end are inclusive
		let range = `bytes=${start}-`;
		if (end !== undefined) {
			range += end;
		}
		return range;
	}

	public async read(
		buffer: Buffer,
		bufferOffset: number,
		length: number,
		sourceOffset: number,
	): Promise<ReadResult> {
		const response = await this.axiosInstance({
			method: this.axiosInstance.defaults.method || 'get',
			url: this.redirectUrl,
			responseType: 'arraybuffer',
			headers: {
				Range: this.getRange(sourceOffset, sourceOffset + length - 1),
			},
		});
		const bytesRead = response.data.length;
		// TODO: it would be nice to avoid copying here but it would require modifying axios
		response.data.copy(buffer, bufferOffset);
		return { bytesRead, buffer };
	}

	public async createReadStream({
		emitProgress = false,
		start = 0,
		end,
		enableCache
	}: CreateReadStreamOptions = {}): Promise<NodeJS.ReadableStream> {
		let cacheStream: fs.WriteStream | undefined;
		let dataEnd: (() => void) | undefined;
		console.log("Http createReadStream", start, end, enableCache)
		if (enableCache) {
			const name = (await this.getMetadata()).name;
			if (name) {
				const localStorage = getLocalStorage();
				fs.mkdirSync(localStorage, { recursive: true });
				const cacheFile = path.join(localStorage, name);

				if (
					fs.existsSync(cacheFile) &&
					fs.statSync(cacheFile).size === this.size
				) {
					return fs.createReadStream(cacheFile);
				} else {
					try {
						const filePath = path.join(localStorage, name + '.part');
						cacheStream = fs.createWriteStream(filePath);
						dataEnd = () => fs.renameSync(filePath, cacheFile);
					} catch (e) {}
				}
			}
		}

		const response = await this.axiosInstance({
			method: this.axiosInstance.defaults.method || 'get',
			url: this.redirectUrl,
			headers: {
				Range: this.getRange(start, end),
			},
			responseType: 'stream',
		});

		if (cacheStream) {
			response.data.pipe(cacheStream);
			response.data.pause();
		}
		if (dataEnd) {
			response.data.on('end', dataEnd);
		}
		if (emitProgress) {
			let bytes = 0;
			let lastTime = Date.now();
			response.data.on('data', (chunk: Buffer) => {
				const now = Date.now();
				const length = chunk.length;
				bytes += length;
				const speed = length / ((now - lastTime) / 1000);
				lastTime = now;
				response.data.emit('progress', {
					position: bytes,
					bytes,
					speed,
				});
			});
			response.data.pause();
		}
		if (end !== undefined) {
			// +1 because start and end are inclusive
			return new StreamLimiter(response.data, end - start + 1);
		}
		return response.data;
	}
}
