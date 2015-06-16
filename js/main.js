angular.module('diloo',['ngSails'])
		.config(['$sailsProvider', function ($sailsProvider) {
    		$sailsProvider.url = 'http://54.200.192.15:1337/';
		}])
		.controller('TicketController',TicketController);
function TicketController($scope,$sails){
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
		$scope.ticketStatus=!$scope.ticketStatus;
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
}