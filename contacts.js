angular
  .module("contacts-app", [])
  .controller("ContactsController", function ($scope, ContactService) {
    $scope.currentDate = new Date().toISOString().split("T")[0]

    $scope.contacts = []
    $scope.editingContact = {}
    $scope.isEditing = false

    function resetFields() {
      $scope.nome = ""
      $scope.idade = ""
      $scope.dataNascimento = ""
      $scope.email = ""
      $scope.telefone = ""
      $scope.celular = ""
      $scope.logradouro = ""
      $scope.cidade = ""
      $scope.bairro = ""
      $scope.numero = ""
      $scope.uf = ""
      $scope.isEditing = false
      $scope.editingContact = {}
    }

    function formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      const hours = String(date.getHours()).padStart(2, "0")
      const minutes = String(date.getMinutes()).padStart(2, "0")
      const seconds = String(date.getSeconds()).padStart(2, "0")
      const milliseconds = String(date.getMilliseconds()).padStart(3, "0")

      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`
    }

    ContactService.getAllContacts()
      .then(function (contacts) {
        $scope.contacts = contacts
      })
      .catch(function (error) {
        console.error("Erro ao obter contatos:", error)
      })

    $scope.savePerson = function () {
      if ($scope.isEditing) {
        const personDataEdited = {
          nome: $scope.editingContact.nome,
          idade: $scope.editingContact.idade,
          dataNascimento: $scope.editingContact.dataNascimento,
          email: $scope.editingContact.email,
          telefone: $scope.editingContact.telefone,
          celular: $scope.editingContact.celular
        }

        ContactService.updateContact($scope.editingContact.pessoaId, personDataEdited)
          .then(function () {
            const index = $scope.contacts.findIndex(
              (contact) => contact.pessoaId === $scope.editingContact.pessoaId
            )
            if (index !== -1) {
              $scope.contacts[index] = angular.copy($scope.editingContact)
            }

            console.log("Contato editado com sucesso!")
            resetFields()
          })
          .catch(function (error) {
            console.error("Erro ao editar o contato:", error)
          })
      } else {
        const date = new Date($scope.dataNascimento)
        const formattedDate = formatDate(date)

        const personData = {
          nome: $scope.nome,
          idade: $scope.idade,
          dataNascimento: formattedDate,
          email: $scope.email,
          telefone: $scope.telefone,
          celular: $scope.celular
        }

        console.log(personData)
        ContactService.savePerson(personData)
          .then(function (personId) {
            const addressData = {
              logradouro: $scope.logradouro,
              cidade: $scope.cidade,
              bairro: $scope.bairro,
              numero: $scope.numero,
              uf: $scope.uf,
              pessoaId: personId
            }

            console.log(addressData)

            return ContactService.saveAddress(addressData)
          })
          .then(function () {
            console.log("Pessoa e endereço salvos com sucesso!")
            resetFields()
            $("#myModal").modal("hide")
          })
          .catch(function (error) {
            console.error("Erro ao salvar pessoa ou endereço:", error)
          })
      }
    }

    $scope.deleteContact = function (contactId) {
      ContactService.deleteContact(contactId)
        .then(function () {
          const index = $scope.contacts.indexOf(
            (contact) => contact.pessoaId === contactId
          )
          if (index !== -1) {
            $scope.contacts.splice(index, 1)
          }
          console.log("Contato excluído com sucesso!")
        })
        .catch(function (error) {
          console.error("Erro ao excluir o contato:", error)
        })
    }

    $scope.editContact = function (contact) {
      $scope.isEditing = true

      let formattedContact = {
        pessoaId: contact.personId,
        nome: contact.nome,
        idade: contact.idade,
        dataNascimento: contact.dataNascimento,
        email: contact.email,
        telefone: contact.telefone,
        celular: contact.celular,
        logradouro: contact.logradouro,
        cidade: contact.cidade,
        bairro: contact.bairro,
        numero: contact.numero,
        uf: contact.uf
      }

      angular.copy(formattedContact, $scope.editingContact)
    }
  })

  .service("ContactService", function ($http) {
    this.BASE_URL = "https://www.selida.com.br/avaliacaotecnica/api"
    this.HEADERS = {
      "Content-Type": "application/json",
      Chave: "93E74BA7-2A30-4517-91E1-DDC3DF2558F0"
    }

    this.getAllContacts = function () {
      return $http({
        method: "GET",
        url: `${this.BASE_URL}/Pessoas/GetAll`,
        headers: this.HEADERS
      }).then(function (response) {
        return response.data.data
      })
    }

    this.getContactById = function (id) {
      return $http({
        method: "GET",
        url: `${this.BASE_URL}/Pessoas/${id}`,
        headers: this.HEADERS,
        params: {
          id: id
        }
      }).then(function (response) {
        return response.data.data
      })
    }

    this.savePerson = function (personData) {
      return $http({
        method: "POST",
        url: `${this.BASE_URL}/Pessoas`,
        headers: this.HEADERS,
        data: personData
      }).then(function (response) {
        return response.data.data
      })
    }

    this.saveAddress = function (addressData) {
      return $http({
        method: "POST",
        url: `${this.BASE_URL}/Endereco`,
        headers: this.HEADERS,
        data: addressData
      })
    }

    this.deleteContact = function (contactId) {
      return $http({
        method: "DELETE",
        url: `${this.BASE_URL}/Pessoas/${contactId}`,
        headers: this.HEADERS,
        params: {
          pessoaId: contactId
        }
      })
    }

    this.updateContact = function (contactId, personData) {
      return $http({
        method: "PUT",
        url: `${this.BASE_URL}/Pessoas/${contactId}`,
        headers: this.HEADERS,
        data: personData
      })
    }
  })
