import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { toolRoutes } from '@/router'

// 工具点击统计接口
interface ToolClickStats {
  [toolPath: string]: {
    count: number
    lastClicked: Date
    title: string
    description: string
    icon: string
    category: string
  }
}

export const useToolStatsStore = defineStore('toolStats', () => {
  // 从localStorage加载统计数据
  const loadStatsFromStorage = (): ToolClickStats => {
    try {
      const stored = localStorage.getItem('toolClickStats')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  // 保存统计数据到localStorage
  const saveStatsToStorage = (stats: ToolClickStats) => {
    try {
      localStorage.setItem('toolClickStats', JSON.stringify(stats))
    } catch (error) {
      console.warn('无法保存工具统计数据到localStorage:', error)
    }
  }

  // 工具点击统计数据
  const clickStats = ref<ToolClickStats>(loadStatsFromStorage())

  // 记录工具点击
  const recordToolClick = (toolPath: string) => {
    const tool = toolRoutes.find(route => route.path === toolPath)
    if (!tool) return

    if (!clickStats.value[toolPath]) {
      clickStats.value[toolPath] = {
        count: 0,
        lastClicked: new Date(),
        title: tool.title,
        description: tool.description,
        icon: tool.icon,
        category: tool.category
      }
    }

    clickStats.value[toolPath].count++
    clickStats.value[toolPath].lastClicked = new Date()
    
    // 保存到localStorage
    saveStatsToStorage(clickStats.value)
  }

  // 获取最常用的工具（前N个）
  const getTopTools = (limit: number = 3) => {
    return computed(() => {
      return Object.entries(clickStats.value)
        .map(([path, stats]) => ({
          path,
          ...stats
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
    })
  }

  // 获取工具点击次数
  const getToolClickCount = (toolPath: string) => {
    return computed(() => clickStats.value[toolPath]?.count || 0)
  }

  // 获取总点击次数
  const totalClicks = computed(() => {
    return Object.values(clickStats.value).reduce((total, stats) => total + stats.count, 0)
  })

  // 清除统计数据
  const clearStats = () => {
    clickStats.value = {}
    localStorage.removeItem('toolClickStats')
  }

  return {
    clickStats,
    recordToolClick,
    getTopTools,
    getToolClickCount,
    totalClicks,
    clearStats
  }
})