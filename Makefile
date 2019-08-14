all:; \
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
	-o evm \
	sol/BMath.sol \
	sol/BPool.sol \
	sol/BToken.sol \
