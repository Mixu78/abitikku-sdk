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

import { createDecompressor, parseFileIndex } from 'lzma-native';
import { totalmem } from 'os';
import { Transform } from 'stream';
import { promisify } from 'util';

import { CompressedSource } from './compressed-source';
import { SourceDestination } from './source-destination';

const parseFileIndexAsync = promisify(parseFileIndex);

export class XzSource extends CompressedSource {
	public static readonly mimetype = 'application/x-xz';

	protected createTransform(): Transform {
		return createDecompressor({ memlimit: Math.floor(totalmem() * 0.2) });
	}

	protected async getSize(): Promise<
		{ size: number; isEstimated: boolean } | undefined
	> {
		if (!(await this.source.canRead())) {
			const sizeFromPartitionTable = await this.getSizeFromPartitionTable();
			if (sizeFromPartitionTable !== undefined) {
				return { size: sizeFromPartitionTable, isEstimated: true };
			}
			return;
		}
		const { size } = await this.source.getMetadata();
		if (size === undefined) {
			return;
		}
		const { uncompressedSize } = await parseFileIndexAsync({
			fileSize: size,
			read: async (
				count: number,
				offset: number,
				callback: (error: Error | null, buffer?: Buffer) => Promise<void>,
			) => {
				try {
					const readResult = await this.source.read(
						Buffer.allocUnsafe(count),
						0,
						count,
						offset,
					);
					callback(null, readResult.buffer);
				} catch (error) {
					callback(error);
				}
			},
		});
		return { size: uncompressedSize, isEstimated: false };
	}
}

SourceDestination.register(XzSource);
