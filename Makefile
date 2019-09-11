all: build
build:
	solc \
	--optimize \
	--pretty-json \
	--combined-json abi,bin \
	--abi \
	--bin \
	--overwrite\
		/=/ \
	-o out/tmp \
	sol/BFactory.sol \
	sol/BMathPub.sol \
	sol/BPool.sol \
	sol/TToken.sol
dist:
	solc \
	--optimize \
	--pretty-json \
	--combined-json abi,bin,metadata \
	--abi \
	--bin \
	--metadata \
	--overwrite\
		/=/ \
	-o out \
	sol/BFactory.sol \
	sol/BPool.sol \
