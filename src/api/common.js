import { Notify } from 'quasar'

function create_notify(msg, type = 'positive', options = {}) {
    Notify.create({
        type: type,
        message: msg,
        position: 'top',
        timeout: 1000,
        ...options
    })
}

export { create_notify }
