all: build dist
dist:
	cp tmp/combined.json out && rm tmp/combined.json
build:
	solc \
	--optimize \
	--pretty-json \
	--combined-json abi,bin,bin-runtime,metadata \
	--overwrite \
		erc20=lib/erc20/src \
		ds-token=lib/ds-token/src \
		ds-math=lib/ds-math/src \
		ds-note=lib/ds-note/src \
		ds-stop=lib/ds-stop/src \
		ds-auth=lib/ds-auth/src \
	/=/ \
	-o tmp \
	sol/BBronze.sol \
	sol/BColor.sol \
	sol/BConst.sol \
	sol/BError.sol \
	sol/BEvent.sol \
	sol/BFactory.sol \
	sol/BMath.sol \
	sol/BNote.sol \
	sol/BNum.sol \
	sol/BPool.sol \
	sol/BToken.sol \
	sol/TToken.sol \

