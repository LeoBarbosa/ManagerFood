// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var db = null;
angular.module('starter', ['ionic','ngCordova'])

.run(function($ionicPlatform, $cordovaSQLite) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    
    db = $cordovaSQLite.openDB({name:"my.db"});
    //CRIANDO TABELAS
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS ingredientes(id INTEGER PRIMARY KEY AUTOINCREMENT, nome text, quantidade real, valor real)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS receitas(id INTEGER PRIMARY KEY AUTOINCREMENT, nome text, quantidadeFinal real, valorUnidade real, valorTotal real)");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS ingredientesRec(quantidade real,ingredientesId INTEGER NOT NULL, receitasId INTEGER NOT NULL, FOREIGN KEY(ingredientesId) REFERENCES ingredientes(id), FOREIGN KEY(receitasId) REFERENCES receitas(id) )");
  });
})

//ROTAS
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('index', {
    url: '/',
    templateUrl: 'home.html'
  })
  .state('ingredientes', {
    url: '/ingredientes',
    templateUrl: 'ingredientes.html'
  })
  .state('receitas', {
    url: '/receitas',
    templateUrl: 'receitas.html'
  })
  .state('vendas',{
    url: '/vendas',
    templateUrl: 'vendas.html'
  })
  $urlRouterProvider.otherwise("/");
})

.controller("MainCtrl", function($scope, $ionicSideMenuDelegate, $cordovaSQLite, $cordovaToast){
  //VARIAVEIS
  $scope.classClick = 0;
  $scope.exibe = false;
  $scope.exibe2 = false;
  $scope.exibe3 = false;
  $scope.editando = false;
  $scope.ingredientes = [];
  $scope.ingrediente = {};
  $scope.receitas = [
  // {
  //   id:1,
  //   nome:'pao de mel'
  // },
  // {
  //   id:2,
  //   nome:'bolo'
  // }
  ];
  $scope.receita = {};
  $scope.mensagem = [];
  $scope.ingredientesRec = [];
  $scope.ingredienteRec = {};
  $scope.idReceitas = [];
  $scope.dadosIngredientesRec = [];
  $scope.dadosIngredientes = [];
  $scope.temp = 0;
  //TOAST
  $scope.showToast = function(message, duration, location) {
      $cordovaToast.show(message, duration, location).then(function(success) {
          console.log("The toast was shown");
      }, function (error) {
          console.log("The toast was not shown due to " + error);
      });
  }
  //MENU
  $scope.toggleLeft = function(){
    $ionicSideMenuDelegate.toggleLeft();
  }
  //INGREDIENTES
  $scope.listarIngredientes = function(){
    //AUTOSELECT
    var query = "select id, nome, quantidade, valor from ingredientes";
    $cordovaSQLite.execute(db, query).then(function(result){
    if(result.rows.length > 0){
      $scope.ingredientes = [];
      for(var i=0; i<result.rows.length; i++){
        $scope.ingredientes.push(result.rows.item(i));
      }
    }else{
      $scope.mensagem.push("vazio");
    }
    }, function(error){
    $scope.mensagem.push(error);
    });
  } 
  $scope.novoIngrediente = function(){
    $scope.ingrediente = {};
    $scope.indexEditando=null;
    $scope.exibe = true;
    $scope.editando = false;
  }
  $scope.salvarIngrediente = function(ingrediente){
    var clone = angular.copy(ingrediente);
    if($scope.indexEditando != null){
			
      var query = "update ingredientes set nome = ?, quantidade = ?, valor = ? where id = ?";
      $cordovaSQLite.execute(db, query, [clone.nome, clone.quantidade, clone.valor, clone.id]).then(function(result){
        $scope.showToast('Ingrediente Atualizado!','long','bottom');
      }, function(error){
        console.log(error);
      });
			$scope.indexEditando=null;
		}else {
      //INSERT
      var query = "insert into ingredientes ('nome', 'quantidade', 'valor') values(?,?,?)";
    	$cordovaSQLite.execute(db, query,[clone.nome,clone.quantidade,clone.valor]).then(function(){
        $scope.showToast('Ingrediente Adicionado!','long','bottom');
      },function(error){
    		$scope.mensagem.push(error);
    	});
    }
    $scope.listarIngredientes();
    $scope.exibe = false;
  }

  $scope.excluirIngrediente = function(id){
    var query = "delete from ingredientes where id = ?";
    $cordovaSQLite.execute(db, query, [id]).then(function(result){
      $scope.showToast('Ingrediente Excluido!','long','bottom');
      console.log("Deletado!");
    }, function(error){
      console.log(error);
    })
    $scope.listarIngredientes();
    $scope.exibe = false;
  }
  $scope.editarIngrediente = function(id, ingrediente){
    $scope.ingrediente = angular.copy(ingrediente);
		$scope.exibe = true;
		$scope.indexEditando = id;
		$scope.editando = true;
  }
  //RECEITAS
  $scope.novaReceita = function(){
    $scope.receita = {};
    $scope.indexEditando=null;
    $scope.exibe = true;
    $scope.editando = false;
  }  
  $scope.listarReceitas = function(){
    var query = "select id, nome, quantidadeFinal, valorUnidade, valorTotal from receitas";
    $cordovaSQLite.execute(db, query).then(function(result){
    if(result.rows.length > 0){
      $scope.receitas = [];
      for(var i=0; i<result.rows.length; i++){
        $scope.receitas.push(result.rows.item(i));
      }
    }else{
      $scope.mensagem.push("vazio");
    }
    }, function(error){
      $scope.mensagem.push(error);
    });
  }
  $scope.salvarReceita = function(receita){
    var clone = angular.copy(receita);
    if($scope.indexEditando != null){
      var query = "update receitas set nome = ?, quantidadeFinal = ?, valorUnidade = ?, valorTotal = ? where id = ?";
      $cordovaSQLite.execute(db, query, [clone.nome, clone.quantidadeFinal, clone.valorUnidade,clone.valorTotal, clone.id]).then(function(result){
        $scope.showToast('Receita Atualizada!','long','bottom');
      }, function(error){
        console.log(error);
      });
      $scope.indexEditando=null;
    }else {
      //INSERT
      var query = "insert into receitas ('nome', 'quantidadeFinal','valorUnidade', 'valorTotal') values(?,?,?,?)";
      $cordovaSQLite.execute(db, query,[clone.nome,clone.quantidadeFinal,clone.valorUnidade, clone.valorTotal]).then(function(){
        $scope.showToast('Receita Adicionada!','long','bottom');
      },function(error){
        $scope.mensagem.push(error);
      });
    }
    $scope.listarReceitas();
    $scope.exibe = false;
    $scope.classClick = 0;
  }
  $scope.editarReceita = function(id, receita){
    $scope.receita = angular.copy(receita);
    $scope.exibe = true;
    $scope.indexEditando = id;
    $scope.editando = true;
  }
  $scope.excluirReceita = function(id){
    var query = "delete from receitas where id = ?";
    $cordovaSQLite.execute(db, query, [id]).then(function(result){
      $scope.showToast('Receita Excluida!','long','bottom');
      console.log("Deletado!");
    }, function(error){
      console.log(error);
    })
    $scope.listarReceitas();
    $scope.exibe = false;
  }

  //INGREDIENTES DA RECEITA
  $scope.adicionarIngredienteReceita = function(){
    $scope.exibe2 = true;
    $scope.listarIngredientes();
  }
  $scope.listarIngredientesReceita = function(id){
    $scope.ingredientesRec = [];
    $scope.ingredienteRec = {};
    //retirar apos teste
    $scope.calculaValorTotalReceita(id);
    var idReceitaAtual = id;
    //temp é teste
    //$scope.temp = idReceitaAtual;
    $scope.classClick = idReceitaAtual;
    var query = "select ingredientesId, receitasId, ingredientesRec.quantidade, ingredientes.nome from ingredientesRec inner join ingredientes on ingredientes.id = ingredientesId where receitasId = ?";
    $cordovaSQLite.execute(db, query, [idReceitaAtual]).then(function(result){
    if(result.rows.length > 0){
      for(var i=0; i<result.rows.length; i++){
        $scope.ingredientesRec.push(result.rows.item(i));
      }
    }else{
      $scope.ingredientesRec.push("vazio");
    }
    }, function(error){
      $scope.ingredientesRec.push(error);
    });
  }
  $scope.salvarIngredienteReceita = function(ingredienteRec){
    var clone = angular.copy(ingredienteRec);
    //$scope.temp.push(clone.receitaId);
    if($scope.indexEditando != null){
      // var query = "update receitas set nome = ?, quantidadeFinal = ?, valorUnidade = ?, valorTotal = ? where id = ?";
      // $cordovaSQLite.execute(db, query, [clone.nome, clone.quantidadeFinal, clone.valorUnidade,clone.valorTotal, clone.id]).then(function(result){
      //   $scope.showToast('Receita Atualizada!','long','bottom');
      // }, function(error){
      //   console.log(error);
      // });
      // $scope.indexEditando=null;
    }else {
      //INSERT
      var query = "insert into ingredientesRec ('quantidade','ingredientesId', 'receitasId') values(?,?,?)";
      $cordovaSQLite.execute(db, query,[clone.quantidade, clone.ingredienteId,clone.receitaId]).then(function(){
        $scope.showToast('Ingrediente Adicionado à Receita!','long','bottom');
      },function(error){
        $scope.ingredientesRec.push(error);
      });
    }
    //CALCULA O VALOR TOTAL DA RECEITA
    //$scope.calculaValorTotalReceita(clone.receitaId);
    $scope.exibe2 = false;
    $scope.exibe3 = false;
  }
  $scope.calculaValorTotalReceita = function(id){
    var idReceitaAtual = angular.copy(id);
    var query = "select ingredientesId, receitasId, ingredientesRec.quantidade as quantidadeUsada, ingredientes.nome, ingredientes.valor, ingredientes.quantidade from ingredientesRec inner join ingredientes on ingredientes.id = ingredientesId where receitasId = ?";
    $cordovaSQLite.execute(db, query, [idReceitaAtual]).then(function(result){
      if(result.rows.length > 0){
        for(var i=0; i<result.rows.length; i++){
          $scope.dadosIngredientesRec.push(result.rows.item(i));
        }
        //TEMP SEMPRE TESTE
        //$scope.temp = $scope.dadosIngredientesRec.length;
        angular.forEach($scope.dadosIngredientesRec, function(value, key){
          var qtdeTotal = value.quantidade;
          var qtdeUsada = value.quantidadeUsada;
          var valorTotal = value.valor;

          var porcentagemEmReaisUsada = 
        })
      }
    // //     //       for(var d=0; d<result.rows.length; d++){
    // //     //         $scope.dadosIngredientesRec.push(result.rows.item(d));
    // //     //         for (var e in dadosIngredientesRec) {
    // //     //           //dadosIngredientesRec[e].quantidade;
    // //     //           //dadosIngredientesRec[e].ingredientesId;
    // //     //           var query3 = "select quantidade, valor from ingredientes where id = ? ";
    // //     //           $cordovaSQLite.execute(db, query, [dadosIngredientesRec[e].ingredientesId]).then(function(result){
    // //     //             $scope.dadosIngredientes.push(result.rows.item(e));
    // //     //             for (var f in dadosIngredientes) {
    // //     //               //dadosIngredientes[f].quantidade;
    // //     //               //dadosIngredientes[f].ingredientesId;
    // //     //               $scope.temp = $scope.temp + dadosIngredientesRec[e].quantidade;

    // //     //             }
    // //     //           }, function(error){

    // //     //           })
    // //     //         }
    // //     //       }
    // //     //     }
    // //     // }, function(error){
    // //     //     $scope.dadosIngredientesRec.push(error);
    // //     //})   

    // //   }
    

    }, function(error){
       $scope.dadosIngredientesRec(error);
    })

  }
  $scope.editarIngredienteReceita = function(id, receita){
    $scope.receita = angular.copy(receita);
    $scope.exibe = true;
    $scope.indexEditando = id;
    $scope.editando = true;
  }
  $scope.excluirIngredienteReceita = function(id){
    var query = "delete from receitas where id = ?";
    $cordovaSQLite.execute(db, query, [id]).then(function(result){
      $scope.showToast('Receita Excluida!','long','bottom');
      console.log("Deletado!");
    }, function(error){
      console.log(error);
    })
    $scope.listarReceitas();
    $scope.exibe = false;
  }
})

/* TO-DO
a funcao calculaValorTotalReceita está sendo chamada ao listarIngredientesReceitas mas deve apos concluida ser chama a toda vez que um novo ingrediente for adicionar em 'salvarIngredientesReceitas'
