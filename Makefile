all: build dist
dist:
	cp tmp/combined.json out && rm tmp/combined.json
build:
	solc \
	--optimize \
	--pretty-json \
	--combined-json abi,bin,metadata \
	--overwrite \
		erc20=lib/erc20/src \
	/=/ \
	-o out/tmp \
	sol/BColor.sol \
	sol/BConst.sol \
	sol/BError.sol \
	sol/BFactory.sol \
	sol/BMath.sol \
	sol/BNum.sol \
	sol/BPool.sol \
	sol/BToken.sol \
	sol/TToken.sol \

