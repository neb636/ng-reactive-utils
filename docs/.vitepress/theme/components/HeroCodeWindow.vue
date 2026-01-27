<script setup lang="ts">
import { useData } from 'vitepress';

const { isDark } = useData();
</script>

<template>
  <div class="hero-code-window">
    <!-- Light Theme Window -->
    <svg
      v-show="!isDark"
      class="code-window"
      width="520"
      height="340"
      viewBox="0 0 520 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Shadow -->
      <g filter="url(#shadow-light)">
        <!-- Window Background -->
        <rect x="10" y="10" width="500" height="320" rx="12" fill="#FFFFFF" />
      </g>

      <!-- Title Bar -->
      <rect x="10" y="10" width="500" height="36" rx="12" fill="#F6F6F6" />
      <rect x="10" y="34" width="500" height="12" fill="#F6F6F6" />

      <!-- Traffic Lights -->
      <circle cx="30" cy="28" r="6" fill="url(#redGradient)" />
      <circle cx="50" cy="28" r="6" fill="url(#yellowGradient)" />
      <circle cx="70" cy="28" r="6" fill="url(#greenGradient)" />

      <!-- Window Title -->
      <text
        x="260"
        y="32"
        font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        font-size="12"
        fill="#86868B"
        text-anchor="middle"
        font-weight="500"
      >
        search.component.ts
      </text>

      <!-- Code Content -->
      <g font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="11.5">
        <!-- Line 1: import -->
        <text x="24" y="68" fill="#6B7280">1</text>
        <text x="48" y="68">
          <tspan fill="#CF222E">import</tspan>
          <tspan fill="#24292F"> { </tspan>
          <tspan fill="#953800">computed</tspan>
          <tspan fill="#24292F"> } </tspan>
          <tspan fill="#CF222E">from</tspan>
          <tspan fill="#0A3069"> '@angular/core'</tspan>
          <tspan fill="#24292F">;</tspan>
        </text>

        <!-- Line 2: import -->
        <text x="24" y="86" fill="#6B7280">2</text>
        <text x="48" y="86">
          <tspan fill="#CF222E">import</tspan>
          <tspan fill="#24292F"> {</tspan>
        </text>

        <!-- Line 3: composables -->
        <text x="24" y="104" fill="#6B7280">3</text>
        <text x="48" y="104">
          <tspan fill="#24292F">  </tspan>
          <tspan fill="#953800">useControlValue</tspan>
          <tspan fill="#24292F">, </tspan>
          <tspan fill="#953800">useDebouncedSignal</tspan>
          <tspan fill="#24292F">, </tspan>
          <tspan fill="#953800">useWindowSize</tspan>
        </text>

        <!-- Line 4: from -->
        <text x="24" y="122" fill="#6B7280">4</text>
        <text x="48" y="122">
          <tspan fill="#24292F">} </tspan>
          <tspan fill="#CF222E">from</tspan>
          <tspan fill="#0A3069"> 'ng-reactive-utils'</tspan>
          <tspan fill="#24292F">;</tspan>
        </text>

        <!-- Line 5: empty -->
        <text x="24" y="140" fill="#6B7280">5</text>

        <!-- Line 6: comment -->
        <text x="24" y="158" fill="#6B7280">6</text>
        <text x="48" y="158">
          <tspan fill="#6E7781">// Convert FormControl to reactive signal</tspan>
        </text>

        <!-- Line 7: class property -->
        <text x="24" y="176" fill="#6B7280">7</text>
        <text x="48" y="176">
          <tspan fill="#953800">searchControl</tspan>
          <tspan fill="#24292F"> = </tspan>
          <tspan fill="#CF222E">new</tspan>
          <tspan fill="#8250DF"> FormControl</tspan>
          <tspan fill="#24292F">(</tspan>
          <tspan fill="#0A3069">''</tspan>
          <tspan fill="#24292F">);</tspan>
        </text>

        <!-- Line 8: reactive value -->
        <text x="24" y="194" fill="#6B7280">8</text>
        <text x="48" y="194">
          <tspan fill="#953800">searchValue</tspan>
          <tspan fill="#24292F"> = </tspan>
          <tspan fill="#8250DF">useControlValue</tspan>
          <tspan fill="#24292F">(</tspan>
          <tspan fill="#CF222E">this</tspan>
          <tspan fill="#24292F">.searchControl);</tspan>
        </text>

        <!-- Line 9: empty -->
        <text x="24" y="212" fill="#6B7280">9</text>

        <!-- Line 10: comment -->
        <text x="24" y="230" fill="#6B7280">10</text>
        <text x="48" y="230">
          <tspan fill="#6E7781">// Debounce for API calls, track window size</tspan>
        </text>

        <!-- Line 11: debounced -->
        <text x="24" y="248" fill="#6B7280">11</text>
        <text x="48" y="248">
          <tspan fill="#953800">debouncedSearch</tspan>
          <tspan fill="#24292F"> = </tspan>
          <tspan fill="#8250DF">useDebouncedSignal</tspan>
          <tspan fill="#24292F">(</tspan>
          <tspan fill="#CF222E">this</tspan>
          <tspan fill="#24292F">.searchValue, </tspan>
          <tspan fill="#0550AE">300</tspan>
          <tspan fill="#24292F">);</tspan>
        </text>

        <!-- Line 12: window size -->
        <text x="24" y="266" fill="#6B7280">12</text>
        <text x="48" y="266">
          <tspan fill="#953800">windowSize</tspan>
          <tspan fill="#24292F"> = </tspan>
          <tspan fill="#8250DF">useWindowSize</tspan>
          <tspan fill="#24292F">();</tspan>
        </text>

        <!-- Line 13: empty -->
        <text x="24" y="284" fill="#6B7280">13</text>

        <!-- Line 14: computed -->
        <text x="24" y="302" fill="#6B7280">14</text>
        <text x="48" y="302">
          <tspan fill="#6E7781">// Compose into derived state</tspan>
        </text>

        <!-- Line 15: isMobile -->
        <text x="24" y="320" fill="#6B7280">15</text>
        <text x="48" y="320">
          <tspan fill="#953800">isMobile</tspan>
          <tspan fill="#24292F"> = </tspan>
          <tspan fill="#8250DF">computed</tspan>
          <tspan fill="#24292F">(() => </tspan>
          <tspan fill="#CF222E">this</tspan>
          <tspan fill="#24292F">.windowSize().width &lt; </tspan>
          <tspan fill="#0550AE">768</tspan>
          <tspan fill="#24292F">);</tspan>
        </text>
      </g>

      <!-- Outer Border -->
      <rect x="10" y="10" width="500" height="320" rx="12" stroke="#E5E5E5" stroke-width="1" fill="none" />

      <!-- Defs -->
      <defs>
        <filter id="shadow-light" x="-10" y="-5" width="540" height="360" filterUnits="userSpaceOnUse">
          <feGaussianBlur in="SourceAlpha" stdDeviation="8" />
          <feOffset dx="0" dy="8" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.12" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <radialGradient id="redGradient" cx="0.3" cy="0.3">
          <stop offset="0%" stop-color="#FF6B63" />
          <stop offset="100%" stop-color="#FF5F57" />
        </radialGradient>

        <radialGradient id="yellowGradient" cx="0.3" cy="0.3">
          <stop offset="0%" stop-color="#FFC532" />
          <stop offset="100%" stop-color="#FEBC2E" />
        </radialGradient>

        <radialGradient id="greenGradient" cx="0.3" cy="0.3">
          <stop offset="0%" stop-color="#32D74B" />
          <stop offset="100%" stop-color="#28C840" />
        </radialGradient>
      </defs>
    </svg>

    <!-- Dark Theme Window -->
    <svg
      v-show="isDark"
      class="code-window"
      width="520"
      height="340"
      viewBox="0 0 520 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Shadow -->
      <g filter="url(#shadow-dark)">
        <!-- Window Background -->
        <rect x="10" y="10" width="500" height="320" rx="12" fill="#1E1E1E" />
      </g>

      <!-- Title Bar -->
      <rect x="10" y="10" width="500" height="36" rx="12" fill="#2D2D2D" />
      <rect x="10" y="34" width="500" height="12" fill="#2D2D2D" />

      <!-- Traffic Lights -->
      <circle cx="30" cy="28" r="6" fill="url(#redGradientDark)" />
      <circle cx="50" cy="28" r="6" fill="url(#yellowGradientDark)" />
      <circle cx="70" cy="28" r="6" fill="url(#greenGradientDark)" />

      <!-- Window Title -->
      <text
        x="260"
        y="32"
        font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        font-size="12"
        fill="#8B8B8B"
        text-anchor="middle"
        font-weight="500"
      >
        search.component.ts
      </text>

      <!-- Code Content (Dark Theme - VS Code Dark+ colors) -->
      <g font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="11.5">
        <!-- Line 1: import -->
        <text x="24" y="68" fill="#6A737D">1</text>
        <text x="48" y="68">
          <tspan fill="#C586C0">import</tspan>
          <tspan fill="#D4D4D4"> { </tspan>
          <tspan fill="#9CDCFE">computed</tspan>
          <tspan fill="#D4D4D4"> } </tspan>
          <tspan fill="#C586C0">from</tspan>
          <tspan fill="#CE9178"> '@angular/core'</tspan>
          <tspan fill="#D4D4D4">;</tspan>
        </text>

        <!-- Line 2: import -->
        <text x="24" y="86" fill="#6A737D">2</text>
        <text x="48" y="86">
          <tspan fill="#C586C0">import</tspan>
          <tspan fill="#D4D4D4"> {</tspan>
        </text>

        <!-- Line 3: composables -->
        <text x="24" y="104" fill="#6A737D">3</text>
        <text x="48" y="104">
          <tspan fill="#D4D4D4">  </tspan>
          <tspan fill="#9CDCFE">useControlValue</tspan>
          <tspan fill="#D4D4D4">, </tspan>
          <tspan fill="#9CDCFE">useDebouncedSignal</tspan>
          <tspan fill="#D4D4D4">, </tspan>
          <tspan fill="#9CDCFE">useWindowSize</tspan>
        </text>

        <!-- Line 4: from -->
        <text x="24" y="122" fill="#6A737D">4</text>
        <text x="48" y="122">
          <tspan fill="#D4D4D4">} </tspan>
          <tspan fill="#C586C0">from</tspan>
          <tspan fill="#CE9178"> 'ng-reactive-utils'</tspan>
          <tspan fill="#D4D4D4">;</tspan>
        </text>

        <!-- Line 5: empty -->
        <text x="24" y="140" fill="#6A737D">5</text>

        <!-- Line 6: comment -->
        <text x="24" y="158" fill="#6A737D">6</text>
        <text x="48" y="158">
          <tspan fill="#6A9955">// Convert FormControl to reactive signal</tspan>
        </text>

        <!-- Line 7: class property -->
        <text x="24" y="176" fill="#6A737D">7</text>
        <text x="48" y="176">
          <tspan fill="#9CDCFE">searchControl</tspan>
          <tspan fill="#D4D4D4"> = </tspan>
          <tspan fill="#C586C0">new</tspan>
          <tspan fill="#4EC9B0"> FormControl</tspan>
          <tspan fill="#D4D4D4">(</tspan>
          <tspan fill="#CE9178">''</tspan>
          <tspan fill="#D4D4D4">);</tspan>
        </text>

        <!-- Line 8: reactive value -->
        <text x="24" y="194" fill="#6A737D">8</text>
        <text x="48" y="194">
          <tspan fill="#9CDCFE">searchValue</tspan>
          <tspan fill="#D4D4D4"> = </tspan>
          <tspan fill="#DCDCAA">useControlValue</tspan>
          <tspan fill="#D4D4D4">(</tspan>
          <tspan fill="#C586C0">this</tspan>
          <tspan fill="#D4D4D4">.searchControl);</tspan>
        </text>

        <!-- Line 9: empty -->
        <text x="24" y="212" fill="#6A737D">9</text>

        <!-- Line 10: comment -->
        <text x="24" y="230" fill="#6A737D">10</text>
        <text x="48" y="230">
          <tspan fill="#6A9955">// Debounce for API calls, track window size</tspan>
        </text>

        <!-- Line 11: debounced -->
        <text x="24" y="248" fill="#6A737D">11</text>
        <text x="48" y="248">
          <tspan fill="#9CDCFE">debouncedSearch</tspan>
          <tspan fill="#D4D4D4"> = </tspan>
          <tspan fill="#DCDCAA">useDebouncedSignal</tspan>
          <tspan fill="#D4D4D4">(</tspan>
          <tspan fill="#C586C0">this</tspan>
          <tspan fill="#D4D4D4">.searchValue, </tspan>
          <tspan fill="#B5CEA8">300</tspan>
          <tspan fill="#D4D4D4">);</tspan>
        </text>

        <!-- Line 12: window size -->
        <text x="24" y="266" fill="#6A737D">12</text>
        <text x="48" y="266">
          <tspan fill="#9CDCFE">windowSize</tspan>
          <tspan fill="#D4D4D4"> = </tspan>
          <tspan fill="#DCDCAA">useWindowSize</tspan>
          <tspan fill="#D4D4D4">();</tspan>
        </text>

        <!-- Line 13: empty -->
        <text x="24" y="284" fill="#6A737D">13</text>

        <!-- Line 14: computed -->
        <text x="24" y="302" fill="#6A737D">14</text>
        <text x="48" y="302">
          <tspan fill="#6A9955">// Compose into derived state</tspan>
        </text>

        <!-- Line 15: isMobile -->
        <text x="24" y="320" fill="#6A737D">15</text>
        <text x="48" y="320">
          <tspan fill="#9CDCFE">isMobile</tspan>
          <tspan fill="#D4D4D4"> = </tspan>
          <tspan fill="#DCDCAA">computed</tspan>
          <tspan fill="#D4D4D4">(() => </tspan>
          <tspan fill="#C586C0">this</tspan>
          <tspan fill="#D4D4D4">.windowSize().width &lt; </tspan>
          <tspan fill="#B5CEA8">768</tspan>
          <tspan fill="#D4D4D4">);</tspan>
        </text>
      </g>

      <!-- Outer Border -->
      <rect x="10" y="10" width="500" height="320" rx="12" stroke="#3D3D3D" stroke-width="1" fill="none" />

      <!-- Defs -->
      <defs>
        <filter id="shadow-dark" x="-10" y="-5" width="540" height="360" filterUnits="userSpaceOnUse">
          <feGaussianBlur in="SourceAlpha" stdDeviation="10" />
          <feOffset dx="0" dy="10" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.25" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <radialGradient id="redGradientDark" cx="0.3" cy="0.3">
          <stop offset="0%" stop-color="#ED6A5E" />
          <stop offset="100%" stop-color="#E1564A" />
        </radialGradient>

        <radialGradient id="yellowGradientDark" cx="0.3" cy="0.3">
          <stop offset="0%" stop-color="#F5BF4F" />
          <stop offset="100%" stop-color="#F0B429" />
        </radialGradient>

        <radialGradient id="greenGradientDark" cx="0.3" cy="0.3">
          <stop offset="0%" stop-color="#61C554" />
          <stop offset="100%" stop-color="#4DB841" />
        </radialGradient>
      </defs>
    </svg>
  </div>
</template>

<style scoped>
.hero-code-window {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.code-window {
  width: 100%;
  height: auto;
  max-width: 600px;
}

@media (max-width: 960px) {
  .hero-code-window {
    max-width: 100%;
    padding: 0 24px;
  }

  .code-window {
    max-width: 100%;
  }
}

@media (max-width: 640px) {
  .hero-code-window {
    padding: 0 16px;
  }
}
</style>
