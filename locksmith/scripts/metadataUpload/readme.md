Providing a rough script allowing Lock owners with the ability to upload/update metadata associated with
their Nonfungible Tokens. 

Instructions:

1. Install ts-node

Required information:

1. Private Key
2. Lock Address
3. Locksmith Host
4. Location of data to be updated (absolute paths please)
5. Scope ('default' for default anything else for key specific metadata)


**Update Default Token Metadata**
`ts-node ./scripts/metadataUpload/metadata_upload.ts --privateKey <private key> --lockAddress <lock address> --host https://locksmith.unlock-protocol.com --inputFile <location of metadata json> --scope default`


**Update Token Specific Metadata**
`ts-node ./scripts/metadataUpload/metadata_upload.ts --privateKey <private key> --lockAddress <lock address> --host https://locksmith.unlock-protocol.com --inputFile <location of metadata json> --scope token`