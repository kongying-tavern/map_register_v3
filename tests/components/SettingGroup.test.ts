import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import SettingGroup from '@/components/AppSettings/components/SettingGroup.vue'

describe('settingGroup', () => {
  it('渲染名称并透传默认插槽内容', () => {
    const wrapper = mount(SettingGroup, {
      props: { name: '基础设置' },
      slots: {
        default: () => h('span', { 'data-test': 'content' }, '插槽内容'),
      },
    })

    expect(wrapper.get('.font-bold').text()).toBe('基础设置')
    expect(wrapper.get('[data-test="content"]').text()).toBe('插槽内容')
  })
})
