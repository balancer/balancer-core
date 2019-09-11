all: build dist
dist:
	cp out/tmp/combined.json out/ && rm out/tmp/combined.json
build:
	solc \
	--optimize \
	--pretty-json \
	--combined-json abi,bin,metadata \
	--overwrite\
		/=/ \
	-o out/tmp \
	sol/BColor.sol \
	sol/BConst.sol \
	sol/BFactory.sol \
	sol/BMath.sol \
	sol/BMathPub.sol \
	sol/BPool.sol \
	sol/BToken.sol \
	sol/TToken.sol \

