export function GetCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export function SetCookie(name, value, minute = 60){
    const d = new Date();
    d.setTime(d.getTime() + minute * 60 * 60 * 1000);
    let expires = "expires="+ d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

