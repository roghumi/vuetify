<template>
  <v-progress-linear v-if="pwa.loading" indeterminate color="primary" height="3" class="pwa-loader" />
  <router-view />
</template>

<script setup lang="ts">
  // Composables
  import { useHead } from '@vueuse/head'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'
  import { useTheme } from 'vuetify'
  import { useUserStore } from '@/store/user'
  import { usePwaStore } from '@/store/pwa'

  // Utilities
  import { computed, nextTick, onBeforeMount, ref, watch, watchEffect } from 'vue'
  import { genAppMetaInfo } from '@/util/metadata'
  import { getMatchMedia } from '@/util/helpers'

  // Globals
  import { IN_BROWSER } from '@/util/globals'

  const user = useUserStore()
  const pwa = usePwaStore()
  const router = useRouter()
  const route = useRoute()
  const theme = useTheme()
  const { locale } = useI18n()

  const path = computed(() => route.path.replace(`/${locale.value}/`, ''))

  const meta = computed(() => {
    return genAppMetaInfo({
      title: `${route.meta.title}${path.value === '' ? '' : ' — Vuetify'}`,
      description: route.meta.description,
      keywords: route.meta.keywords,
      assets: route.meta.assets,
    })
  })

  useHead({
    title: computed(() => meta.value.title),
    meta: computed(() => meta.value.meta),
    link: computed(() => meta.value.link),
  })

  onBeforeMount(() => {
    // set current route lang if root
    const currentRoute = router.currentRoute.value
    if (currentRoute.path === '/') {
      router.replace(`/${locale.value}`)
    }
  })

  const systemTheme = ref('light')
  if (IN_BROWSER) {
    let media: MediaQueryList
    watch(() => user.theme, val => {
      if (val === 'system') {
        media = getMatchMedia()!
        media.addListener(onThemeChange)
        onThemeChange()
      } else if (media) {
        media.removeListener(onThemeChange)
      }
    }, { immediate: true })
    function onThemeChange () {
      systemTheme.value = media!.matches ? 'dark' : 'light'
    }

    watchEffect(() => {
      theme.global.name.value = (
        user.theme === 'system' ? systemTheme.value : user.theme
      )
    })

    watch(theme.global.name, themeTransition)

    function themeTransition () {
      const x = performance.now()
      for (let i = 0; i++ < 1e7; i << 9 & 9 % 9 * 9 + 9);
      if (performance.now() - x > 10) return

      const el: HTMLElement = document.querySelector('[data-v-app]')!
      const children = el.querySelectorAll('*') as NodeListOf<HTMLElement>

      children.forEach(el => {
        if (hasScrollbar(el)) {
          el.dataset.scrollX = String(el.scrollLeft)
          el.dataset.scrollY = String(el.scrollTop)
        }
      })

      const copy = el.cloneNode(true) as HTMLElement
      copy.classList.add('app-copy')
      const rect = el.getBoundingClientRect()
      copy.style.top = rect.top + 'px'
      copy.style.left = rect.left + 'px'
      copy.style.width = rect.width + 'px'
      copy.style.height = rect.height + 'px'

      const targetEl = document.activeElement as HTMLElement
      const targetRect = targetEl.getBoundingClientRect()
      const left = targetRect.left + targetRect.width / 2 + window.scrollX
      const top = targetRect.top + targetRect.height / 2 + window.scrollY
      el.style.setProperty('--clip-pos', `${left}px ${top}px`)
      el.style.removeProperty('--clip-size')

      nextTick(() => {
        el.classList.add('app-transition')
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.setProperty('--clip-size', Math.hypot(window.innerWidth, window.innerHeight) + 'px')
          })
        })
      })

      document.body.append(copy)

      ;(copy.querySelectorAll('[data-scroll-x], [data-scroll-y]') as NodeListOf<HTMLElement>).forEach(el => {
        el.scrollLeft = +el.dataset.scrollX!
        el.scrollTop = +el.dataset.scrollY!
      })

      function onTransitionend (e: TransitionEvent) {
        if (e.target === e.currentTarget) {
          copy.remove()
          el.removeEventListener('transitionend', onTransitionend)
          el.removeEventListener('transitioncancel', onTransitionend)
          el.classList.remove('app-transition')
          el.style.removeProperty('--clip-size')
          el.style.removeProperty('--clip-pos')
        }
      }
      el.addEventListener('transitionend', onTransitionend)
      el.addEventListener('transitioncancel', onTransitionend)
    }

    function hasScrollbar (el?: Element | null) {
      if (!el || el.nodeType !== Node.ELEMENT_NODE) return false

      const style = window.getComputedStyle(el)
      return style.overflowY === 'scroll' || (style.overflowY === 'auto' && el.scrollHeight > el.clientHeight)
    }
  }
</script>

<style lang="sass">
  a:not(:hover)
    text-decoration: none

  p
    margin-bottom: 1rem

    a, a:visited
      color: rgb(var(--v-theme-primary))

  h1
    + p
      font-size: 1.25rem
      font-weight: 300

  ul:not([class]),
  ol:not([class])
    padding-left: 20px
    margin-bottom: 16px

  // Theme transition
  .app-copy
    position: fixed !important
    z-index: -1 !important
    pointer-events: none !important
    contain: size style !important
    overflow: clip !important

  .app-transition
    --clip-size: 0
    --clip-pos: 0 0
    clip-path: circle(var(--clip-size) at var(--clip-pos))
    transition: clip-path .35s ease-out
</style>

<style lang="sass" scoped>
  .pwa-loader
    position: fixed
    top: 0
    left: 0
    right: 0
    z-index: 1010
</style>
