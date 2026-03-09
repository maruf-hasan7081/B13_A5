document.getElementById("btn").addEventListener("click", function () {

    const input = document.getElementById("username")
    const inputValue = input.value;

    const password = document.getElementById("password")
    const passwordValue = password.value;

    if(inputValue==="admin" && passwordValue==="admin123"){


        alert("Login Successful")
        window.location.href = "/home.html"

    }
    else if(inputValue==="" && passwordValue===""){
        alert("Please Enter Username and Password")
    }
    else{
        alert("Invalid Username or Password")
    }

})