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
	-o out/tmp/ \
	contracts/BFactory.sol \
	contracts/BStub.sol \
	contracts/BPool.sol \
	contracts/TToken.sol
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
	-o out/tmp/ \
	sol/BFactory.sol \
	sol/BPool.sol \
\
	&& cp out/tmp/combined.json out \
	&& cp out/tmp/BFactory* out \
	&& cp out/tmp/BPool* out \
	&& echo 'Copied select build output to out/'
