import { Notify } from 'quasar'
function create_notify(type = 'positive', msg) {
    Notify.create({
        type: type,
        message: msg,
        position: 'top'
    })
}
export { create_notify }