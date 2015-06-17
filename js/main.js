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
		.controller('TicketController',TicketController);
function TicketController($scope,$sails,Excel,$timeout){
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