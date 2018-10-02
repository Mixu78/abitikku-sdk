## v0.1.0 - 2018-08-28

* Fix(ci): Install libudev-dev on ci [Alexis Svinartchouk]
* Fix(progress): Fallback to source progress on gzip streams [Alexis Svinartchouk]
* Fix(scanner): Export DriverlessDevice [Alexis Svinartchouk]
* Use the BlockDevice or File in read and write streams, not the fd [Alexis Svinartchouk]

## v0.1.24 - 2018-10-02

* Fix(usbboot): Fix usbboot devices display name [Alexis Svinartchouk]

## v0.1.23 - 2018-09-21

* Fix(resin-s3-source): Allow changing the s3 host [Alexis Svinartchouk]

## v0.1.22 - 2018-09-18

* Update(udif): Update udif to ^0.15.7 [Alexis Svinartchouk]

## v0.1.21 - 2018-09-18

* Fix(block-device): Fix BlockDevice.alignedRead() bytesRead property [Alexis Svinartchouk]

## v0.1.20 - 2018-09-18

* Update(resin-lint): Update resin-lint to ^2.0.1 [Alexis Svinartchouk]

## v0.1.19 - 2018-09-18

* Update(typescript): Update typescript to ^3.0.3 [Alexis Svinartchouk]

## v0.1.18 - 2018-09-17

* Fix(npm): Publish the typings folder [Alexis Svinartchouk]

## v0.1.17 - 2018-09-17

* Fix(http): Catch errors that may happen during a HEAD request [Alexis Svinartchouk]

## v0.1.16 - 2018-09-11

* Fix(errors): Set VerificationError.code to EVALIDATION [Alexis Svinartchouk]

## v0.1.15 - 2018-09-07

* Fix(tests): Don't unmount files in tests [Alexis Svinartchouk]

## v0.1.14 - 2018-09-07

* Blockdevice: Use aligned reads / writes on MacOS [Jonas Hermsmeier]

## v0.1.13 - 2018-09-06

* Fix(block-transform-stream): Flush last bytes [Alexis Svinartchouk]

## v0.1.12 - 2018-09-04

* Update(drivelist): Update drivelist to ^6.4.2 [Alexis Svinartchouk]

## v0.1.11 - 2018-09-03

* Fix(source-destination): Only emit progress events if needed [Alexis Svinartchouk]
* Fix(source-destination): Remove unused methods [Alexis Svinartchouk]

## v0.1.10 - 2018-09-03

* Feat(block-transform-stream): Faster writes for compressed images [Alexis Svinartchouk]
* Fix(lint): Fix linter errors [Alexis Svinartchouk]

## v0.1.9 - 2018-08-31

* Fix(package): Build before publishing [Alexis Svinartchouk]

## v0.1.8 - 2018-08-31

* Fix(package): Only publish built files [Alexis Svinartchouk]

## v0.1.7 - 2018-08-30

* Feat(gzip): Add isSizeEstimated=true in gzip images metadata [Alexis Svinartchouk]

## v0.1.6 - 2018-08-30

* Fix(block-write-stream): Fix block-write-stream tests [Alexis Svinartchouk]

## v0.1.5 - 2018-08-29

* Fix(block-write-stream): Write 1MiB blocks [Alexis Svinartchouk]

## v0.1.4 - 2018-08-29

* Fix(block-read-stream): Read 1MiB blocks instead of 64KiB blocks [Alexis Svinartchouk]

## v0.1.3 - 2018-08-28

* Update(drivelist): Update drivelist to ^6.4.1 [Alexis Svinartchouk]

## v0.1.2 - 2018-08-28

* Fix(file): Use BlockReadStream for File instances [Alexis Svinartchouk]

## v0.1.1 - 2018-08-28

* Fix(block-device): Don't unmount the drive before flashing on win32 [Alexis Svinartchouk]

* Fix(test): Don't crash if libusb is not available [Alexis Svinartchouk]
* Fix(examples): Fix the scanner example [Alexis Svinartchouk]
* Feat(progress): Report source file progress [Alexis Svinartchouk]
* Fix(progress): Fix makeClassEmitProgressEvents when start != 0 [Alexis Svinartchouk]
* Fix(lint): Add missing semicolons [Alexis Svinartchouk]
* Fix(examples): Update the spinner with the last progress event [Alexis Svinartchouk]
* Fix(lib): Fix type error with @types/bluebird@3.5.23 [Alexis Svinartchouk]
* Fix(lib): Fix getInnerSource for .DMG images [Alexis Svinartchouk]
* Chore(package): Clean build folder before building [Alexis Svinartchouk]
* Chore(package): Update readme, package, add license [Jonas Hermsmeier]
* Ci: Add .resinci.yml to control node build matrices [John (Jack) Brown]
* Fix(lib): Make block-write-stream chunk inputs [Jonas Hermsmeier]
* Chore(package): Add editorconfig [Jonas Hermsmeier]
* Refactor(constants): Reduce progress update frequency to 2 Hz [Jonas Hermsmeier]