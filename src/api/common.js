import { Notify } from 'quasar'
function create_notify(msg, type = 'positive') {
    Notify.create({
        type: type,
        message: msg,
        position: 'top',
        timeout: 1000,
    })
}
export { create_notify }