function AES_Init() {
  AES_Sbox_Inv = new Array(256);
  for(var i = 0; i < 256; i++)
    AES_Sbox_Inv[AES_Sbox[i]] = i;

  AES_ShiftRowTab_Inv = new Array(16);
  for(var i = 0; i < 16; i++)
    AES_ShiftRowTab_Inv[AES_ShiftRowTab[i]] = i;

  AES_xtime = new Array(256);
  for(var i = 0; i < 128; i++) {
    AES_xtime[i] = i << 1;
    AES_xtime[128 + i] = (i << 1) ^ 0x1b;
  }
}

function AES_Done() {
  delete AES_Sbox_Inv;
  delete AES_ShiftRowTab_Inv;
  delete AES_xtime;
}

function AES_ExpandKey(key) {
  var kl = key.length, ks, Rcon = 1;
  switch (kl) {
    case 16: ks = 16 * (10 + 1); break;
    case 24: ks = 16 * (12 + 1); break;
    case 32: ks = 16 * (14 + 1); break;
    default: console.log('Error');
  }
  for(var i = kl; i < ks; i += 4) {
    var temp = key.slice(i - 4, i);
    if (i % kl == 0) {
      temp = new Array(AES_Sbox[temp[1]] ^ Rcon, AES_Sbox[temp[2]], AES_Sbox[temp[3]], AES_Sbox[temp[0]]);
      if ((Rcon <<= 1) >= 256) Rcon ^= 0x11b;
    } else if ((kl > 24) && (i % kl == 16)) temp = new Array(AES_Sbox[temp[0]], AES_Sbox[temp[1]], AES_Sbox[temp[2]], AES_Sbox[temp[3]]);
    for(var j = 0; j < 4; j++)
      key[i + j] = key[i + j - kl] ^ temp[j];
  }

  // ROUND KEY
  for (let z=0; z<ks; z+=16) console.log('Round '+((z/16)+1)+' - '+key.slice(z, z+16).map(function(x) {return x.toString(16);}).join(""))

}

function AES_Encrypt(block, key) {
  console.log('Our message - '+block.map(function(x) {return x.toString(16);}).join(""))
  var l = key.length;
  AES_AddRoundKey(block, key.slice(0, 16));
  for(var i = 16; i < l - 16; i += 16) {
    AES_SubBytes(block, AES_Sbox);
    AES_ShiftRows(block, AES_ShiftRowTab);
    AES_MixColumns(block);
    AES_AddRoundKey(block, key.slice(i, i + 16));
    console.log('Our message - '+block.map(function(x) {return x.toString(16);}).join(""))
  }
  AES_SubBytes(block, AES_Sbox);
  AES_ShiftRows(block, AES_ShiftRowTab);
  AES_AddRoundKey(block, key.slice(i, l));
  console.log('Our message - '+block.map(function(x) {return x.toString(16);}).join(""))
}

function AES_Decrypt(block, key) {
  console.log('Our message - '+block.map(function(x) {return x.toString(16);}).join(""))
  var l = key.length;
  AES_AddRoundKey(block, key.slice(l - 16, l));
  AES_ShiftRows(block, AES_ShiftRowTab_Inv);
  AES_SubBytes(block, AES_Sbox_Inv);
  for(var i = l - 32; i >= 16; i -= 16) {
    console.log('Our message - '+block.map(function(x) {return x.toString(16);}).join(""))
    AES_AddRoundKey(block, key.slice(i, i + 16));
    AES_MixColumns_Inv(block);
    AES_ShiftRows(block, AES_ShiftRowTab_Inv);
    AES_SubBytes(block, AES_Sbox_Inv);
  }
  AES_AddRoundKey(block, key.slice(0, 16));
  console.log('Our message - '+block.map(function(x) {return x.toString(16);}).join(""))
}

AES_Sbox = new Array(99,124,119,123,242,107,111,197,48,1,103,43,254,215,171,
  118,202,130,201,125,250,89,71,240,173,212,162,175,156,164,114,192,183,253,
  147,38,54,63,247,204,52,165,229,241,113,216,49,21,4,199,35,195,24,150,5,154,
  7,18,128,226,235,39,178,117,9,131,44,26,27,110,90,160,82,59,214,179,41,227,
  47,132,83,209,0,237,32,252,177,91,106,203,190,57,74,76,88,207,208,239,170,
  251,67,77,51,133,69,249,2,127,80,60,159,168,81,163,64,143,146,157,56,245,
  188,182,218,33,16,255,243,210,205,12,19,236,95,151,68,23,196,167,126,61,
  100,93,25,115,96,129,79,220,34,42,144,136,70,238,184,20,222,94,11,219,224,
  50,58,10,73,6,36,92,194,211,172,98,145,149,228,121,231,200,55,109,141,213,
  78,169,108,86,244,234,101,122,174,8,186,120,37,46,28,166,180,198,232,221,
  116,31,75,189,139,138,112,62,181,102,72,3,246,14,97,53,87,185,134,193,29,
  158,225,248,152,17,105,217,142,148,155,30,135,233,206,85,40,223,140,161,
  137,13,191,230,66,104,65,153,45,15,176,84,187,22);

AES_ShiftRowTab = new Array(0,5,10,15,4,9,14,3,8,13,2,7,12,1,6,11);

function AES_SubBytes(state, sbox) {
  for(var i = 0; i < 16; i++)
    state[i] = sbox[state[i]];
}

function AES_AddRoundKey(state, rkey) {
  for(var i = 0; i < 16; i++)
    state[i] ^= rkey[i];
}

function AES_ShiftRows(state, shifttab) {
  var h = new Array().concat(state);
  for(var i = 0; i < 16; i++)
    state[i] = h[shifttab[i]];
}

function AES_MixColumns(state) {
  for(var i = 0; i < 16; i += 4) {
    var s0 = state[i + 0], s1 = state[i + 1];
    var s2 = state[i + 2], s3 = state[i + 3];
    var h = s0 ^ s1 ^ s2 ^ s3;
    state[i + 0] ^= h ^ AES_xtime[s0 ^ s1];
    state[i + 1] ^= h ^ AES_xtime[s1 ^ s2];
    state[i + 2] ^= h ^ AES_xtime[s2 ^ s3];
    state[i + 3] ^= h ^ AES_xtime[s3 ^ s0];
  }
}

function AES_MixColumns_Inv(state) {
  for(var i = 0; i < 16; i += 4) {
    var s0 = state[i + 0], s1 = state[i + 1];
    var s2 = state[i + 2], s3 = state[i + 3];
    var h = s0 ^ s1 ^ s2 ^ s3;
    var xh = AES_xtime[h];
    var h1 = AES_xtime[AES_xtime[xh ^ s0 ^ s2]] ^ h;
    var h2 = AES_xtime[AES_xtime[xh ^ s1 ^ s3]] ^ h;
    state[i + 0] ^= h1 ^ AES_xtime[s0 ^ s1];
    state[i + 1] ^= h2 ^ AES_xtime[s1 ^ s2];
    state[i + 2] ^= h1 ^ AES_xtime[s2 ^ s3];
    state[i + 3] ^= h2 ^ AES_xtime[s3 ^ s0];
  }
}

function encrypt_prep() {
  x = document.getElementById("en-text").value;
  y = document.getElementById("en-key").value;

  if (x && y) {
    if (y.length==16 || y.length==24 || y.length==32) {
      encrypt(x, y);
    } else {
      alert('Key must be 16,24 or 32 chars long');
      document.getElementById("en-res").innerHTML = 'Error';
    }
  }
}

function encrypt(x, y) {

  AES_Init();

  var block = [];
  block = x.toString().split('');
  z = 0;
  block.forEach((x) => {
      block[z] = x.toString().charCodeAt();
      z++;
  });

  var key = [];
  key = y.toString().split('');
  z = 0;
  key.forEach((x) => {
      key[z] = x.toString().charCodeAt();
      z++;
  });

  AES_ExpandKey(key);
  AES_Encrypt(block, key);

  document.getElementById("en-res").innerHTML = '';
  block.forEach((x) => {
      let temp = x.toString(16);
      if (temp.length==1) temp = '0'+temp;
      document.getElementById("en-res").innerHTML += temp;
      y++;
  });

  AES_Done();
}

function decrypt_prep() {
  x = document.getElementById("de-text").value;
  y = document.getElementById("de-key").value;

  if (x && y) {
    if (y.length==16 || y.length==24 || y.length==32) {
      decrypt(x, y);
    } else {
      alert('Key must be 16,24 or 32 chars long');
      document.getElementById("de-res").innerHTML = 'Error';
    }
  }
}

function decrypt(x, y) {

  AES_Init();

  var block = [];
  let z = 0;
  while (x[z*2]) {
    block[z] = x.substr(z*2, 2);
    z++;
  }
  z=0;
  block.forEach((x) => {
      block[z] = parseInt(x, 16);
      z++;
  });

  var key = [];
  key = y.toString().split('');
  z = 0;
  key.forEach((x) => {
      key[z] = x.toString().charCodeAt();
      z++;
  });

  AES_ExpandKey(key);
  AES_Decrypt(block, key);

  document.getElementById("de-res").innerHTML = '';
  block.forEach((x) => {
      document.getElementById("de-res").innerHTML += String.fromCharCode(x);
      y++;
  });

  AES_Done();
}
