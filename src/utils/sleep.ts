/**
 * 顾名思义，阻塞线程一定时间（异步）
 * @param time 阻塞的毫秒数
 */
export const sleep = (time: number) => new Promise(resolve => setTimeout(resolve, time))
