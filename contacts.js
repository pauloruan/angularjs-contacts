angular
  .module("contacts-app", [])
  .controller("ContactsController", function ($scope) {
    $scope.currentDate = new Date().toISOString().split("T")[0]
  })
  .controller("GetAllContacts", function ($scope, $http) {
    $http({
      method: "GET",
      url: "https://www.selida.com.br/avaliacaotecnica/api/Pessoas/GetAll",
      headers: {
        "Content-Type": "application/json",
        Chave: "93E74BA7-2A30-4517-91E1-DDC3DF2558F0"
      }
    }).then(
      function successCallback(response) {
        $scope.contacts = response.data.data
      },
      function errorCallback(response) {
        console.log(response)
      }
    )
  })
