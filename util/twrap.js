module.exports = class TWrap {

  constructor(bundle) {
    this.__bundle = bundle;
    this.__abi = bundle.abi;
    this._lastGas;
    this._lastEvents;
    if( typeof(bundle.abi) == 'string' ) {
       this.__abi = JSON.parse(bundle.abi);
    }
    this.__bin = bundle.bin;
    for( let item of this.__abi ) {
      if(item.type == 'function') {
        this[item.name] = async function() {
          if (this.__address == undefined) {
            throw new Error(
`Tried to call a function on a type (call it on an instance instead): ${item.name}`
            );
          } else {
            let fn = this.__web3obj.methods[item.name](...arguments);
            let result;
            let gas;
            try {
                result = await fn.call();
                let tx = await fn.send(this.__web3.eth.defaultOptions);
                this._lastGas = tx.gasUsed;
                this._lastEvents = tx.events;
            } catch (err) {
                if (err != null && err.name == 'RuntimeError') {
                    assert(Object.keys(err.results).length == 1, 'more than one exception in transaction!?');
                    let trxID = Object.keys(err.results)[0];
                    result = err.results[trxID].reason;
                }
            }
            let args = Array.prototype.slice.call(arguments);
            let desc = `[gas: ${this._lastGas}]`;
            desc = this.__web3.utils.padRight(desc, 16, ' ');
            desc += `${item.name}(${args})`;
            desc += `\n`;
            desc += ' '.repeat(16) + ` -> ${result}`;
            this._lastDesc = desc;
            return result;

          }
        }
      }
    }
  }

  async deploy(web3, args) {
    let opts = web3.eth.defaultOptions;
    let T = new TWrap(this.__bundle);
    T.__web3 = web3;
    T.__web3obj = await new web3.eth.Contract(this.__abi)
                                    .deploy({data: this.__bin, arguments: args})
                                    .send(opts);
        
    T.__address = T.__web3obj._address;
    return T;
  }

  at(web3, address) {
    let T = new TWrap(this.__bundle);
    T.__web3 = web3;
    T.__address = address;
    T.__web3obj = new this.__web3.eth.Contract(T.__abi, T.__address);
    return T;
  }
}
