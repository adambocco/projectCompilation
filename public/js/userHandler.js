const userNav = document.querySelector("#userNav");
let tok = null;

const handleLogin = async function () {
    let username = document.querySelector("#loginUsername").value;
    let password = document.querySelector("#loginPassword").value;
    let loginStatus
    try {
        loginStatus = await axios.post("http://" + window.location.hostname + ":3000/users/login", JSON.stringify({"username": username, "password": password}),
        {
            headers: {
              'Content-Type': 'application/json'
            }
          });
    } catch (err) {console.log(err)}
    console.log("LOGINSTATUS: ",loginStatus)
    tok = loginStatus.data.token;
    handleSwitch("loggedInSwitch")
};

const handleLogout = async function() {
    handleSwitch("loginSwitch");
    let logoutStatus;
    try {
         
        logoutStatus = await axios.post("http://" + window.location.hostname + ":3000/users/logout",        
        {
            headers: {
              'Content-Type': 'application/json',
              'token': tok
            }
        })
    }catch(err) {console.log(err)}
}

const handleRegister = async function() {
    let registerStatus;
    try {
        let payload = {}
        payload.username = document.querySelector("#registerUsername").value
        payload.email = document.querySelector("#registerEmail").value
        payload.password = document.querySelector("#registerPassword1").value
        registerStatus = await axios.post("http://" + window.location.hostname + ":3000/users/signup",  payload,     
        {
            headers: {
              'Content-Type': 'application/json',
              'token': tok
            }
        })
        console.log(registerStatus)
    }catch(err) {console.log(err)}
}

const handleSwitch = function(switchTo) {
    userNav.innerHTML = ""
    if (switchTo === "loggedInSwitch" && checkLoginStatus()) {
        userLogout = document.createElement('button');
        userLogout.className = "btn btn-outline-info m-1";
        userLogout.innerHTML = "Logout"
        userLogout.addEventListener("click", ev=> {
            handleLogout();
            handleSwitch("loginSwitch");
        })
        userNav.appendChild(userLogout)
    }
    else if (switchTo === "registerSwitch") {
        userRegisterTag = document.createElement('span')
        userRegisterTag.className = "font-weight-bold"
        userRegisterTag.innerHTML = "Register: "
        userRegisterUsername = document.createElement('input')
        userRegisterUsername.className = "mx-1"
        userRegisterUsername.id = "registerUsername"
        userRegisterUsername.setAttribute("type", "text")
        userRegisterUsername.setAttribute("placeholder", "Username")
        userRegisterEmail = document.createElement('input')
        userRegisterEmail.className = "mx-1"
        userRegisterEmail.id = "registerEmail"
        userRegisterEmail.setAttribute("type", "text")
        userRegisterEmail.setAttribute("placeholder", "Email")
        userRegisterPassword1 = document.createElement('input')
        userRegisterPassword1.className = "mx-1"
        userRegisterPassword1.id = "registerPassword1";
        userRegisterPassword1.setAttribute("type", "text")
        userRegisterPassword1.setAttribute("placeholder", "Password")
        userRegisterPassword2 = document.createElement('input')
        userRegisterPassword2.className = "mx-1"
        userRegisterPassword2.id = "registerPassword2";
        userRegisterPassword2.setAttribute("type", "text")
        userRegisterPassword2.setAttribute("placeholder", "Password Again")
        userRegisterButton = document.createElement('button')
        userRegisterButton.className = "mx-1 btn btn-outline-primary"
        userRegisterButton.setAttribute("type", "button")
        userRegisterButton.innerHTML = "->"
        userRegisterButton.addEventListener("click", ev=> {
            handleRegister();
        })
        userLoginSwitchButton = document.createElement('button')
        userLoginSwitchButton.className = "mx-1 btn btn-outline-primary"
        userLoginSwitchButton.setAttribute("type", "button")
        userLoginSwitchButton.innerHTML = "Login"
        userLoginSwitchButton.addEventListener("click", ev=> {
            handleSwitch("loginSwitch");
        })
        userNav.appendChild(userRegisterTag)
        userNav.appendChild(userRegisterUsername)
        userNav.appendChild(userRegisterEmail)
        userNav.appendChild(userRegisterPassword1)
        userNav.appendChild(userRegisterPassword2)
        userNav.appendChild(userRegisterButton)
        userNav.appendChild(userLoginSwitchButton)
    }
    else if (switchTo === "loginSwitch") {
        userLoginTag = document.createElement('span')
        userLoginTag.className = "font-weight-bold"
        userLoginTag.innerHTML = "Login: "
        userLoginUsername = document.createElement('input')
        userLoginUsername.className = "mx-1"
        userLoginUsername.id = "loginUsername"
        userLoginUsername.setAttribute("type", "text")
        userLoginUsername.setAttribute("placeholder", "Username")
        userLoginPassword = document.createElement('input')
        userLoginPassword.className = "mx-1"
        userLoginPassword.id = "loginPassword";
        userLoginPassword.setAttribute("type", "text")
        userLoginPassword.setAttribute("placeholder", "Password")
        userLoginButton = document.createElement('button')
        userLoginButton.className = "mx-1 btn btn-outline-primary"
        userLoginButton.setAttribute("type", "button")
        userLoginButton.innerHTML = "->"
        userLoginButton.addEventListener("click", ev=> {
            handleLogin();
        })
        userRegisterSwitchButton = document.createElement('button')
        userRegisterSwitchButton.className = "mx-1 btn btn-outline-primary"
        userRegisterSwitchButton.setAttribute("type", "button")
        userRegisterSwitchButton.innerHTML = "Register"
        userRegisterSwitchButton.addEventListener("click", ev=> {
            handleSwitch("registerSwitch");
        })
        userNav.appendChild(userLoginTag)
        userNav.appendChild(userLoginUsername)
        userNav.appendChild(userLoginPassword)
        userNav.appendChild(userLoginButton)
        userNav.appendChild(userRegisterSwitchButton)
    }
}

const checkLoginStatus = async function() {

    try {
        loggedIn = await axios.get("http://" + window.location.hostname + ":3000/users/me",        {
            headers: {
              'Content-Type': 'application/json',
              'token': tok
            }
          })
        return true 
    } catch (err) {
        console.log(err)
        return false
    }
};

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

(async function() {
    if (getCookie("dfToken") != "") {
        tok = getCookie("dfToken")
        checkLoginStatus()
        handleSwitch("loggedInSwitch")
    }
    else {
        handleSwitch("loginSwitch")
    }
})()
