let copy = (o) => { return JSON.parse(JSON.stringify(o)); }

module.exports.TType = class {
    constructor(web3, buildout, tname) {
        this.web3 = web3;
        this.buildout = buildout;
        this.tname = tname;
        this.abi = this.buildout[tname].abi;
        if( typeof(this.abi) == 'string' ) {
           this.abi = JSON.parse(this.abi);
        }
        this.bin = this.buildout[tname].bin;
    }

    async deploy(args) {
      let T = new module.exports.TWrap(this.web3, this.buildout, this.tname);
      T.__web3obj = await new this.web3.eth.Contract(this.abi)
                                      .deploy({data: this.bin, arguments: args})
                                      .send(copy(this.web3.opts));
          
      T.__address = T.__web3obj._address;
      return T;
    }

    at(address) {
      let T = new module.exports.TWrap(this.web3, this.buildout, this.tname);
      T.__address = address;
      T.__web3obj = new this.web3.eth.Contract(T.__abi, T.__address);
      return T;
    }
}

module.exports.TWrap = class {
  constructor(web3, buildout, name) {
    this.__web3 = web3;
    this.__buildout = buildout;
    this.__tname = name;
    this.__bundle = this.__buildout[name];
    this.__bin = this.__bundle.bin;
    this.__abi = this.__bundle.abi;
    if( typeof(this.__abi) == 'string') {
        this.__abi = JSON.parse(this.__abi);
    }
    this._lastGas;
    this._lastEvents;
    this._lastDesc;
    for( let func of this.__abi ) {
      if(func.type == 'function') {
        this[func.name] = async function() {

          if (this.__address == undefined) {
            throw new Error(
`Tried to call a function on a type (call it on an instance instead): ${func.name}`
            );
          } else {
            let fn = this.__web3obj.methods[func.name](...arguments);
            let result;
            let gas;
            let opts = copy(this.__web3.opts);
            try {
                result = await fn.call();
                let tx = await fn.send(copy(opts));
                this._lastGas = tx.gasUsed;
                this._lastEvents = tx.events;
            } catch (err) {
                if (err != null && err.name == 'RuntimeError') {
                    assert(Object.keys(err.results).length == 1, 'more than one exception in transaction!?');
                    let trxID = Object.keys(err.results)[0];
                    result = err.results[trxID].reason;
                } else {
                    throw err;
                }
            }
            let args = Array.prototype.slice.call(arguments);
            let desc = `[gas: ${this._lastGas}]`;
            desc = this.__web3.utils.padRight(desc, 16, ' ');
            desc += `${func.name}(${args})`;
            desc += `\n`;
            desc += ' '.repeat(16) + ` -> ${result}`;
            this._lastDesc = desc;
           
            if( func.outputs && func.outputs[0]) {
                let restype = func.outputs[0].internalType;
                if( restype && restype.startsWith('contract ') ) {
                    let tname = func.outputs[0].internalType.split(' ')[1];
                    let ttype = new module.exports.TType(this.__web3, this.__buildout, tname);
                    result = ttype.at(result);
                }
            }
            
            return result;

          }

        }
      }
    }
  }

}
