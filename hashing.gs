function sha256(value){


  /** @type Byte[] */
  var signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value);

  /** @type String */
  var hexString = signature
      .map(function(byte) {
          // Convert from 2's compliment
          var v = (byte < 0) ? 256 + byte : byte;

          // Convert byte to hexadecimal
          return ("0" + v.toString(16)).slice(-2);
      })
      .join("");

  return hexString;

}

function test_sha256(){

  Logger.log(sha256('hi'));
}
