angular.module('diloo',['ngSails'])
		.config(['$sailsProvider', function ($sailsProvider) {
    		$sailsProvider.url = 'http://54.200.192.15:1337/';
		}])
		.factory('Excel',function($window){
	        var uri='data:application/vnd.ms-excel;base64,',
	            template='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
	            base64=function(s){return $window.btoa(unescape(encodeURIComponent(s)));},
	            format=function(s,c){return s.replace(/{(\w+)}/g,function(m,p){return c[p];})};
	        return {
	            tableToExcel:function(tableId,worksheetName){
	                var table=document.getElementById(tableId),
	                    ctx={worksheet:worksheetName,table:table.innerHTML},
	                    href=uri+base64(format(template,ctx));
	                return href;
	            }
	        };
	    })		
		.controller('historyController',historyController)
		.controller('homeController',homeController);

function historyController($scope,$sails,Excel,$timeout){
	$scope.tickets={
		data: [],
		total:0
	}
	$scope.ticketStatus = false;
	$scope.user = {
		data:{},
		show:false
	};
	$scope.messages={
		data:[],
		show:true
	};
	$scope.jump = 0 ;
	$scope.loadMessages=function(){
			$sails.get("/ticket/getCloseds",{areaId:1,companyId:1,skip:$scope.jump})
			.success(function(data,status,headers,jwr){
				$scope.tickets.data = data.tickets;
				$scope.tickets.total= data.len;
				console.log(data)
			})
			.error(function(data,status,headers,jwr){
				console.log(status)
			});
	}
	$scope.loadMessages();//lauching
	$scope.getMessages=function(ticket){
		//getting user info
		$sails.get("/user/getUserInfo",{userId:ticket.userid})
				.success(function(data,status,headers,jwr){
					//console.log(data);
					$scope.user.data=data.user;
				})
				.error(function(data,status,headers,jwr){
					console.log(status)
				});
		//getting messages
		$sails.get("/ticket/gmft",{ticketId:ticket.ticketid})
				.success(function(data,status,headers,jwr){
					console.log(data);
					$scope.messages.data=data.messages;
				})
				.error(function(data,status,headers,jwr){
					console.log(status)
				});		
		//changing ticket state
		$scope.ticketStatus=true;
	}
	$scope.findByUser=function(userName){
		$sails.get("/ticket/findByUser",{areaId:1,companyId:1,skip:$scope.jump,userName:userName})
			.success(function(data,status,headers,jwr){
				$scope.tickets.data = data.tickets;
				$scope.tickets.total= data.len;
				console.log(data)
			})
			.error(function(data,status,headers,jwr){
				console.log(status)
			});
	}
	$scope.closeOpenTicket=function(){
		$scope.ticketStatus=!$scope.ticketStatus;
	}
	$scope.showUser=function(){
		$scope.user.show = true;
		$scope.messages.show = false
	}
	$scope.showMessages=function(){
		$scope.messages.show = true;
		$scope.user.show = false;
	}
	$scope.paginationNext=function(){
		$scope.jump >= $scope.tickets.total ? $scope.jump+=25:$scope.jump+=0;
		$scope.loadMessages();
		console.log($scope.jump)
	}
	$scope.paginationPrev=function(){
		$scope.jump <= 0 ? $scope.jump =0 : $scope.jump-= 25 ;
		$scope.loadMessages();
		console.log($scope.jump)
	}
 	$scope.exportToExcel=function(tableId){ // ex: '#my-table'
        var exportHref=Excel.tableToExcel(tableId,'sheet name');
            $timeout(function(){location.href=exportHref;},100); // trigger download
    }
}
function homeController($scope,$sails){
	$scope.room='1:1';
	$scope.tickets = {
		pendents : [] ,
		open : [] ,
		getPendents:function(){
			console.log('in')
			$sails.get('/ticket/getAreaTickets',{companyId:1,areaId:1})
					.success(function(data,status,headers,jwr){
						console.log('listando pendientes del área')
						var tokens=data.tickets;
						var length = tokens.length;
						var counter = 0;
		                $scope.user.getUserInfo(counter,length,tokens)
					})
					.error(function(data,status,headers,jwr){
						console.log(status);
					});
		},
		getOpenTickets:function(){
			$sails.get('/ticket/getMyTickets',{companyId:1,operatorId:1,areaId:1})
					.success(function(data,status,headers,jwr){
						console.log('obteniendo tickets');
						var tokens=data.tickets;
						var length = tokens.length;
						var counter = 0;
						$scope.user.getUserInfo(counter,length,tokens);					
					})
					.error(function(data,status,headers,jwr){
						console.log(status);
					})
		}
	};
	$scope.user={
		getUserInfo:function(counter,length,tokens){
			if(counter == length) return;
			var self = tokens[counter];
			self.messages=[];
			$sails.get('/user/getUserInfo',{userId:self.user})
					.success(function(data,status,headers,jwr){
		            	self.userInfo=data.user;
						//uniendolo al room del ticket para que reciba notificaciones
						$sails.get('/message/join',{room:self.id})
						        .success(function(data,status,headers,jwr){
						                console.log(data.msg);
						              })
						        .error(function(data,status,headers,jwr){
						        	console.log(status);
						        })
						$sails.get('/message/gmft',{ticket:self.id})
						        .success(function(messages,status,headers,jwr){
						            self.messages=messages.tickets;
						            //agregando la data a pendientes
						            //console.log(self);
						            //$scope.token = self; 
						            if(self.status == 0) {
						            	$scope.tickets.pendents.push(self);
						            }else{
						            	$scope.tickets.open.push(self);
						            }
						            
						        })
						       	.error(function(data,status,headers,jwr){
						       		console.log(status);
						       	}) 
					}).error(function(data,status,headers,jwr){
						console.log(status);
					})
			counter++;
			$scope.user.getUserInfo(counter,length,tokens)
		}
	}
	$scope.joinArea=function(){
		$sails.get('/ticket/join',{room:$scope.room},function(data){
		                console.log('uniendose al área ' + $scope.room);
		                console.log(data.msg);
					});		
	}
	//lauching
	$scope.joinArea();
	$scope.tickets.getPendents();
	$scope.tickets.getOpenTickets();
}

$(document).on('ready',init);

function init(){
	resize();
	$(window).resize(function(){
		resize();
	});
}

function resize(){
	$('.history').css({
		'width':(window.innerWidth - 180)+'px'
	})
}