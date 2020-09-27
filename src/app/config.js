// RUTAS PARA LAS IMAGENES

export let Path = {

    url: 'http://localhost:4200/assets/'
    
    // Cuando necesitemos usar certificado SSL (registro o ingreso con Facebook)
    // url: 'https://localhost:4200/assets/'
};

// RUTA PARA EL ENDPOINT DE LA APIREST DE FIREBASE

export let Api = {

    url: 'https://marketplace-9bcb8.firebaseio.com/'

};

// RUTA PARA EL REGISTRO DE USUARIOS EN FIREBASE AUTHENTICATION

export let Register = {

    url: 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCtsiPNMzYbiniOxpWpCDtbbcfW20CzPrY'

};

// RUTA PARA EL LOGIN DE USUARIOS EN FIREBASE AUTHENTICATION

export let Login = {

    url: 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCtsiPNMzYbiniOxpWpCDtbbcfW20CzPrY'

};

// EXPORTAMOS ESTA URL PARA ENVIAR VERIFICACION DE CORREO ELECTRONICO

export let SendEmailVerification = {

    url: 'https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=AIzaSyCtsiPNMzYbiniOxpWpCDtbbcfW20CzPrY'

};


// EXPORTAMOS ESTA URL PARA CONFIRMAR EL EMAIL DE VERIFICACION

export let ConfirmEmailVerification = {

    url: 'https://identitytoolkit.googleapis.com/v1/accounts:update?key=AIzaSyCtsiPNMzYbiniOxpWpCDtbbcfW20CzPrY'

};

// EXPORTAMOS ESTA URL PARA TOMAR LA DATA DEL USUARIO EN FIREBASE AUTH

export let GetUserData = {

    url: 'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyCtsiPNMzYbiniOxpWpCDtbbcfW20CzPrY'

};

// EXPORTAMOS ESTA URL PARA RESETEAR LA CONTRASEÑA

export let SendPasswordResetEmail = {

    url: 'https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=AIzaSyCtsiPNMzYbiniOxpWpCDtbbcfW20CzPrY'

};


// EXPORTAMOS ESTA URL PARA CONFIRMAR EL CAMBIO DE LA CONTRASEÑA

export let VerifyPasswordResetCode = {

    url: 'https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=AIzaSyCtsiPNMzYbiniOxpWpCDtbbcfW20CzPrY'

};

// EXPORTAMOS ESTA URL PARA ENVIAR LA CONTRASEÑA

export let ConfirmPasswordReset = {

    url: 'https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=AIzaSyCtsiPNMzYbiniOxpWpCDtbbcfW20CzPrY'

};

// EXPORTAMOS ESTA URL PARA CAMBIAR LA CONTRASEÑA

export let ChangePassword = {

    url: 'https://identitytoolkit.googleapis.com/v1/accounts:update?key=AIzaSyCtsiPNMzYbiniOxpWpCDtbbcfW20CzPrY'

};

// EXPORTAMOS ESTA URL DEL SERVIDOR PARA ADMINISTRAR ARCHIVOS

export let Server = {

    url: 'http://localhost/marketplace-account/src/assets/img/index.php?key=AIzaSyCtsiPNMzYbiniOxpWpCDtbbcfW20CzPrY'

};










