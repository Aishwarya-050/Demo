const base = 256;
const prime = 908209935089;  // 12 digit


class Dictionary{
    database
    numberOfWords
};

class Hashing{
    hashTable;
    hashTableKeys;
    primaryA = null;
    primaryB = null;

    stringConvertedNum(word){
        
        var val = 0;
        var a = Math.floor(Math.random() * (prime - 1) ) + 1;  // Lower case word expected
        var b = Math.floor(Math.random() * prime);

        
        if(this.primaryA == null || this.primaryB == null){
            this.primaryA = a;
            this.primaryB = b;
        }
        else{
            a = this.primaryA;
            b = this.primaryB;
        }

        for(var i=0; i<word.length; i++){
            val = ( (val*base) % prime + word.charCodeAt(i) ) % prime;
        }

        const aB = BigInt(a);
        const valB = BigInt(val);
        const primeB = BigInt(prime);
        const bB = BigInt(b);
        const out = (aB*valB + bB) % primeB;

        return Number(out);
    }

    getSecondaryHash(a, b, m, word){
        const aB = BigInt(a);
        const keyB = BigInt(this.stringConvertedNum(word));

        return ( ( Number((aB*keyB)%BigInt(prime)) + b ) % prime ) % m;
    }

    detectedCollision(a, b, m, initialArray, finalArray){
        for(var i=0; i<initialArray.length; i++){
            var secondaryHashValue = this.getSecondaryHash(a, b, m, dictionary.database[initialArray[i]].en);

            if(finalArray[secondaryHashValue]==null){
                finalArray[secondaryHashValue] = initialArray[i];
            }
            else{
                return true;
            }
        }
        return false;
    }


    initializeHashTable(){
        this.hashTable = new Array(dictionary.numberOfWords);
        for(var i=0; i<dictionary.numberOfWords; i++){
            this.hashTable[i] = [];
        }
        this.hashTableKeys = new Array(dictionary.numberOfWords).fill(null);
    }

    secondaryHashGenerate(returnArray, primaryHashValue){
       

        var finalArrayLength = returnArray.length*returnArray.length;
        var finalArray = new Array(finalArrayLength).fill(null);
        var initialArray = Array.from(returnArray);
        var a = Math.floor(Math.random() * (prime - 1) ) + 1;
        var b = Math.floor(Math.random() * prime);
        var itr = 0;

        while(this.detectedCollision(a, b, finalArrayLength, initialArray, finalArray)){
            
            itr = itr+1;
            if(itr>100) {
                throw Error('Many iterations required!');
            }
            
            
            a = Math.floor(Math.random() * (prime - 1) ) + 1;
            b = Math.floor(Math.random() * prime);

            finalArray.fill(null);            
        }

        this.hashTableKeys[primaryHashValue] = [a, b, finalArrayLength];

        return finalArray;  

    }

    isDuplicate(word, array){

        var unique = true;
        for(var i=0; i<array.length; i++){
            if(dictionary.database[array[i]].en == word){
                unique = false;
                break;
            }
        }

        return unique;
    }

  

    primaryHashGenerate(word){       
        return this.stringConvertedNum(word) % dictionary.numberOfWords;
    }

    makeHashTable(){
        this.initializeHashTable();

        for(var i=0; i<dictionary.numberOfWords; i++){
            
            dictionary.database[i].en = dictionary.database[i].en.toLowerCase();  // All words must be converted into lowercase first. We assume AM and am is the same word.
            var word = dictionary.database[i].en;
            var numValue = this.primaryHashGenerate(word);

            if(this.isDuplicate(word, this.hashTable[numValue])){
                
                this.hashTable[numValue].push(i);
            }
        }
        

        
        for(var i=0; i<dictionary.numberOfWords; i++){  // Detect Collisions in primary and apply secondary Hashing
            if(this.hashTable[i].length > 1){

                this.hashTable[i] = this.secondaryHashGenerate(this.hashTable[i], i);  // Number of collision detected in this bucket
                
            }
            else if(this.hashTable[i].length == 1){
                this.hashTableKeys[i] = [1, 0, 1];
            }
        }

    }
}



var hashing = new Hashing();
var dictionary = new Dictionary();

window.onload = function run(){
	database = fetch("https://raw.githubusercontent.com/Aishwarya-050/Demo/main/E2Bdatabase.json")  
	.then(server_response =>{
		if(!server_response.ok){
			throw new Error(server_response.status);
		}

		return server_response.json()
	})
	.then(return_json => {
		dictionary.database = return_json;
        dictionary.numberOfWords = Object.keys(dictionary.database).length;
		//document.getElementById("demo").innerHTML = database.name[0] + database.age[0] +"  "+database.name[1] + database.age[1];
	})
	.then(response => hashing.makeHashTable());
	/*.then(
	value => {console.log(value); }, //success
	reason => { console.error(reason); } //error
	);*/
}



function myFunction() {
	 
	var input = document.getElementById('myText');
    var word = input.value.toLowerCase();
    var output = document.getElementById('demo');
    var pHashing = hashing.stringConvertedNum(word) % dictionary.numberOfWords;
    

    try{
        if(hashing.hashTableKeys[pHashing] == null){
            throw 'Not Found';
        }

        const a = hashing.hashTableKeys[pHashing][0];
        const b = hashing.hashTableKeys[pHashing][1];
        const m = hashing.hashTableKeys[pHashing][2];

        var sHashing = hashing.getSecondaryHash(a, b, m, word);


        if(hashing.hashTable[pHashing][sHashing] != null && 
            dictionary.database[hashing.hashTable[pHashing][sHashing]].en == word){
            output.innerHTML = dictionary.database[hashing.hashTable[pHashing][sHashing]].bn;
        }
        else{
            throw 'Not Found';
        }
    }catch(err){
        console.log(err);
        output.innerHTML = '';
    };

}

