$(document).ready(function () {

    $("#mintSection").css("display","none");
    $("#ownedSection").css("display","none");
    // Check if wallet can be initialized
    // ----------------------------------
    if (window.ethereum) { 
      handleEthereum();
    } 
    else {
      window.addEventListener('ethereum#initialized', handleEthereum, {
            once: true,
        });
        setTimeout(handleEthereum, 3000);
    }
    // ----------------------------------
  
    $("#mintButton").on('click',function() {
      mintNFT();
    });

    $("#refreshButton").on('click',function() {
      if(walletID)
        refreshInfo();        
    });
  
    $("#connectWalletButton").on('click',function() {
      if(!walletID)
        connectWallet();
    });

    $("#transferButton").on('click',function() {
      transferNFT();
    });
  });


  //Configuration -------------------

  const address = "0x32e13161E30acD5CEe7919bA8B07C2543f50f936";
  var networkChain = 250; // Fantom

  const gateway = "https://gateway.ipfs.io/ipfs/";
  const OGGateway = "ipfs://";

  // ----------------------------------
  
  var walletID = "";
  var theTransactionHash = "";
  var nftPrice = 0;
  var lastNFTs = [];
  var ownedNFTs = [];
  var timeoutMs = 150;
  //var abi = [];

  function handleEthereum() {
    const { ethereum } = window;
    if (ethereum) {
      console.log('Ethereum detected!');
      if (window.ethereum) {
        //App.web3 = new Web3(window.ethereum);
        //window.ethereum.enable(); 
        window.ethereum.on('accountsChanged', function (accounts) {
          console.log('accountsChanges',accounts);
          walletID="";
          connectWallet();
        });      
        window.ethereum.on('chainChanged', function(networkId){
          console.log('chainChanged',networkId);          
          walletID="";
          connectWallet();
        });
      }
    }
  }
  
  function resetWallet(){
    if(walletID===""){
      $("#connectWalletButton").html("Connect");
      $("#totalMinted").html("?/8192");
      $("#currentPrice").html("? FTM");
      $("#lastRefreshTime").html("Please connect to wallet for update.");
      $("#guessPrice").html("?");
      $("#mintAmount").html("1");
      $("#mintSection").css("display","none");
      $("#ownedSection").css("display","none");
    }
  }

  // Display warning message
  function warning(message){
    notie.alert({ type: 2, text: message})
  }

  function success(message){
    notie.alert({ type: 1, text: message});
  }

  function error(message){
    notie.alert({ type: 3, text: message});
  }
  
  function connectWallet() {
      if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        ethereum .enable().then(async () => {
              let chain = await web3.eth.getChainId();
              if (chain != networkChain) {
                  warning("Wrong chain selected. Please use Fantom Opera chain.");
                  resetWallet();
                  return;
              }
            console.log("Wallet established");
            web3.eth.getAccounts(function (err, acc) {
              if (err != null) {
                warning("Cannot fetch accounts.");
                resetWallet();
                return;
              }
              if (acc.length > 0) {
                walletID = acc[0];
                $("#connectWalletButton").html("Connected: "+ acc[0].substring(0,4) + "..." + acc[0].substring(38,42));
                setTimeout(() => {
                  refreshInfo();  
                }, timeoutMs);                
                //web3.currentProvider.publicConfigStore.on('update', resetWallet);
                return;
              }
            });
          })
          .catch(() => {
            warning("Connection declined by user.");
            resetWallet();
            waitLogin();
          });
      } else {
        warning("Web3 is not supported on selected browser. Please check if MetaMask is installed.");
        resetWallet();
      }
  }

  function refreshInfo(){
    if(walletID==="") return;

    $("#refreshButton").css({"display":"none"})
        setTimeout(() => {
          $("#refreshButton").css({"display":""})
        }, 3000);

    getLastNFTs(updateGallery);
    getOwnedNFTs(updateGallery);
    setTimeout(() => {
      if(getNFTPrice()!==0 ) {
        $("#lastRefreshTime").html(new Date().toLocaleString());    
        //style="display:none"  
      }
    }, timeoutMs);
  }

  async function getNFTPrice(callback){
    var contract = new web3.eth.Contract(abi, address);
    setTimeout(() => { 
      contract.methods.getPrice().call((err, result) => {
        if (err != null) {
          warning("There was an error fetching price");
          console.log(err);
          $("#currentPrice").html("? FTM");
          if(callback!==undefined)
            callback(0);
          return 0;
        }
        nftPrice = web3.utils.fromWei(result,"ether")
        $("#currentPrice").html(nftPrice + " FTM");
        updateGuessPrice();
        if(callback!==undefined)
          callback(nftPrice);
        return result;
      });
    }, timeoutMs);
  }

  function totalMinted(callback){
    var contract = new web3.eth.Contract(abi, address);
    setTimeout(() => {
      contract.methods.totalSupply().call((err, result) => {
        if (err != null) {
          warning("There was an error fetching total supply");
          console.log(err);
          $("#totalMinted").html("?/8192");
          if(callback!==undefined)
            callback(0);

          return 0;
        }
        $("#totalMinted").html(result + "/8192");
        var _int = parseInt(result);
        if(callback!==undefined)
            callback(_int);
        return _int;
      });
    }, timeoutMs);
  }  
  
  function mintNFT() {
    if (window.ethereum) {
      ethereum.enable().then(() => {
          web3.eth.getAccounts(function (err, acc) {
            if (err != null) {
              warning("There was an error fetching your accounts");
              console.log(err);
              return;
            }

            if (acc.length > 0) {
              var contract = new web3.eth.Contract(abi, address);

              var mintAmount = parseInt($("#mintAmount").val());
              if(isNaN(mintAmount)) {warning("Bad mint amount input"); return;}

              let contractFunctionData = contract.methods.mint(mintAmount).encodeABI();
              
              getNFTPrice(function(nftPrice) {
                var strPrice = (nftPrice * mintAmount).toFixed(3).toString();
                var price = web3.utils.toWei(strPrice, "ether");
                if(price === 0) return;

                web3.eth.sendTransaction({
                    from: acc[0],
                    to: address,
                    value: price,
                    data: contractFunctionData,
                  }) .on('confirmation', function(confirmationNumber, receipt){
                    if(confirmationNumber<2){
                      success("Mint request sent.");
                    }
                  }).on('receipt', function(receipt) {
                    console.log(web3.utils.hexToNumber(receipt.logs[0].topics[3]));
                    success("NFT has been minted. It should take up to a few minutes to generate it.");
                    //refreshInfo();
                  }).on('error',function(err){
                    console.log(err);
                    error("Failed to mint NFT. Price of NFT might be changed.");
                  });
              });
            }
          });
        })
        .catch(() => {
          if(web3.eth==undefined)
          {
            connectWallet();
            mintNFT();
            return;
          }
          warning("There are problem connecting to wallet or minting service. Please check if you are connected to a wallet.");
        });
    } else {
      warning("");
    }
  }
  
  
  function getLastNFTs(finishCallback){
    var contract = new web3.eth.Contract(abi, address);
    setTimeout(() => {
      totalMinted(function(result){
        if(result === 0) return;
        lastNFTs=[];
        var cnt = 0;
        var resolver = [];

        for(var i=result-1;i>(result-4) && i>=0;i--) {
          cnt++;
          setTimeout((ii) => {
            var q = contract.methods.tokenURI(ii).call((err, result) => {
              if(err) {
                console.log(err);
                //warning("Failed to retrieve last NFTs");
                return;
              }
            });   
            resolver.push(q);
          }, timeoutMs*cnt,i);
        }

        setTimeout(() => {
          Promise.all(resolver).then(function(values){
            resolver = [];
            for(var i=0;i<values.length;i++){
              if(values[i]){
                values[i] = values[i].replace(OGGateway,gateway);

                var query = $.getJSON( values[i] , function( data ) {
                  lastNFTs.push(data);
                });
                setTimeout(timeoutMs);
                resolver.push(query);
              }          
            }
            Promise.all(resolver).then(function(){
              if(lastNFTs.length>0 && finishCallback){
                finishCallback("#content","lastMinted", lastNFTs);
              }
            });
          }); 
        }, timeoutMs*4);      
      });
    }, timeoutMs*2);
  }
  
  function getOwnedNFTs(finishCallback){
    ownedNFTs = [];

    var promisesL4 = [];
    var promisesL3 = [];
    var promisesL2 = [];
    var delay = 0;
    var contract = new web3.eth.Contract(abi, address);
    setTimeout(() => {
      contract.methods.balanceOf(walletID).call((err, result) => {
        if (!err) {  

          if(result>0) {
            $("#contentMinted").html("Loading...");
          }

          delay = result+2;
          
          for (let i = 0; i < result; i++) {            
            setTimeout(()=>{ 

              var pL2 = contract.methods.tokenOfOwnerByIndex(walletID, i).call((err, rr) => {
                if(err) {
                  warning("Failed to retrieve owned NFTs");
                  console.log(err);
                  return;
                }
              });

              pL2.then(function(r){
                setTimeout((result) => {
                  contract.methods.tokenURI(result).call((err, url) => {

                    if(err) {
                      warning("Failed to retrieve owned NFT");
                      console.log(err);
                      return;
                    }

                    url = url.replace(OGGateway,gateway);

                    if(url){
                      var query = $.getJSON( url , function( data ) {
                        ownedNFTs.push(data);
                      });
                      promisesL4.push(query);
                    }
                    
                  }); 
                }, timeoutMs, r);
              });

              promisesL2.push(pL2)
            }, timeoutMs*(i+2)*1.1);
            
          }
        } else {
          warning("Failed to retrieve owned NFTs");
          console.log(err);
        }
      }).then(function(){
        setTimeout(() => {
          Promise.all(promisesL2).then(function(){
            setTimeout(() => {
              Promise.all(promisesL3).then(function(){
                setTimeout(() => {
                  Promise.all(promisesL4).then(function(){
                    setTimeout(timeoutMs);
                    if(finishCallback) 
                      finishCallback("#contentMinted","ownedID", ownedNFTs);

                      if(ownedNFTs.length>1){
                        $("#prevMinted").css("display","block");
                        $("#nextMinted").css("display","block");
                      }
                  });
                }, timeoutMs);
              });            
            }, timeoutMs);
          });
        }, delay * timeoutMs);

      });
    }, timeoutMs*2);
  }

  function updateGallery(selector, contentID, array){
    $(selector).html("");
    for(var i=0;i<array.length;i++){

      if(!array[i].image){ 
        continue;
      }

      var imageUrl = array[i].image.replace(OGGateway,gateway);
      var image = $('<div/>', {'class':'galleryImage', 'id':contentID+array[i].Index});
      var imageContent = $('<img/>', {'class':'galleryImg', 'src':imageUrl});
      var span = $('<span/>', {'class':'caption'});
      span.html(array[i].name);
      image.append(imageContent);
      image.append(span);
      imageContent.attr("data-nice-name",array[i].name);
      $(selector).append(image);
      // cia imesti jei nera itemu, tai parente pahidint mygtukus, jei yra tai visible=true
    }
    setImageListeners();
    $("#mintSection").css("display","block");
    $("#ownedSection").css("display","block");
  }  
  
  function transferNFT(){
    if(!walletID)
      return;

    var contract = new web3.eth.Contract(abi, address);
    let tokenID = $("#transferNFTID").val();
    let sendTo = $("#transferNFTAddress").val();
    
    contract.methods.safeTransferFrom(walletID, sendTo, parseInt(tokenID))
    .send({ from: walletID}).on('transactionHash', function(hash){
        success("Transfer request sent.");
    }).on('confirmation', function(confirmationNumber, receipt){
      if(confirmationNumber<1){
        success("Transfer sent.");
      }
    }).on('receipt', function(confirmationNumber, receipt){
      success("Transfer successful.");
      refreshInfo();
    }).on('error', function(err, receipt){
        error("Failed to transfer token. Do You own selected token?")
    })
  }
  
  function checkMintAmountValue(additional){
    var input = $("#mintAmount").val()+String.fromCharCode(additional);
    //var regex = new RegExp("^[1-9]|10$");
    var _int = parseInt(input);
    if(_int>0 && _int<11) {return true;}
    else {
      _int = parseInt(String.fromCharCode(additional));
      $("#mintAmount").val(_int);
      updateGuessPrice();
      return false;
    };
  }

  function updateGuessPrice(amount){
    if(nftPrice!==0)
    {
        var _int = parseInt($("#mintAmount").val());
        $("#guessPrice").html((_int*nftPrice).toFixed(0));
    }    
  }

  function setImageListeners(){
    $(".galleryImg").on("click", function(e){
      $("#modalImg").attr("src", e.target.src);
      $("#modalText").html($(e.target).attr("data-nice-name"));
      $("#myModal").css('display','block');
    });
  }
  
  