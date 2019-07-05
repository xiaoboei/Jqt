var serviceApp = angular.module("starter.services", []);


serviceApp.service("serviceOrderData",function() {
	this.orderData = {
		name:"未选择",
		price:0,
		marketPrice:0,
		num:0,
		express:0,
		totalPrice:0
	};
	this.orderNote = {
		text :"注意快递"
	};
})
.service("addressData",function() {
	this.dataObject = {
		region_id: "",
		true_name: "",
		telephone: "",
		address: ""
	};
	this.dataText = {
		provinceText :"",
		cityText :"",
		areaText :""
	};
	this.selectId = {
		address_id : ""
	};
})
.service("couponData",function() {
	this.dataObject = {
		coupon_code: ""
	};
})
.service("invoiceData",function() {
	this.dataObject = {
		type: "",
		head: "",
		content: ""
	};
})
