import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// 工作区数据类型定义
type WorkspaceData = {
  searchReq: string
  gSearchParams: Record<string, string>
  queryCardsStr: string
  valueFilter: string
}

type Workspace = {
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

const DATA_DIR = path.join(process.cwd(), 'data')
const WORKSPACES_DIR = path.join(DATA_DIR, 'workspaces')
const WORKSPACES_INDEX = path.join(DATA_DIR, 'workspaces.json')

// 确保目录存在
async function ensureDirectories() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
  
  try {
    await fs.access(WORKSPACES_DIR)
  } catch {
    await fs.mkdir(WORKSPACES_DIR, { recursive: true })
  }
}

// 获取所有工作区列表
async function getWorkspaces(): Promise<Workspace[]> {
  try {
    const data = await fs.readFile(WORKSPACES_INDEX, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

// 保存工作区列表
async function saveWorkspaces(workspaces: Workspace[]) {
  await ensureDirectories()
  await fs.writeFile(WORKSPACES_INDEX, JSON.stringify(workspaces, null, 2), 'utf-8')
}

// 获取特定工作区的数据
async function getWorkspaceData(workspaceName: string): Promise<WorkspaceData | null> {
  try {
    const workspaceDir = path.join(WORKSPACES_DIR, workspaceName)
    
    const [searchReq, gSearchParams, queryCardsStr, valueFilter] = await Promise.all([
      fs.readFile(path.join(workspaceDir, 'searchReq.json'), 'utf-8').catch(() => '""'),
      fs.readFile(path.join(workspaceDir, 'gSearchParams.json'), 'utf-8').catch(() => '{}'),
      fs.readFile(path.join(workspaceDir, 'queryCards.json'), 'utf-8').catch(() => '"[]"'),
      fs.readFile(path.join(workspaceDir, 'valueFilter.json'), 'utf-8').catch(() => '"param,createTime,message"'),
    ])

    return {
      searchReq: JSON.parse(searchReq),
      gSearchParams: JSON.parse(gSearchParams),
      queryCardsStr: JSON.parse(queryCardsStr),
      valueFilter: JSON.parse(valueFilter),
    }
  } catch {
    return null
  }
}

// 保存工作区数据
async function saveWorkspaceData(workspaceName: string, data: WorkspaceData) {
  const workspaceDir = path.join(WORKSPACES_DIR, workspaceName)
  
  try {
    await fs.access(workspaceDir)
  } catch {
    await fs.mkdir(workspaceDir, { recursive: true })
  }

  await Promise.all([
    fs.writeFile(path.join(workspaceDir, 'searchReq.json'), JSON.stringify(data.searchReq), 'utf-8'),
    fs.writeFile(path.join(workspaceDir, 'gSearchParams.json'), JSON.stringify(data.gSearchParams), 'utf-8'),
    fs.writeFile(path.join(workspaceDir, 'queryCards.json'), JSON.stringify(data.queryCardsStr), 'utf-8'),
    fs.writeFile(path.join(workspaceDir, 'valueFilter.json'), JSON.stringify(data.valueFilter), 'utf-8'),
  ])
}

// GET: 获取工作区列表或特定工作区数据
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const workspaceName = searchParams.get('name')
  
  try {
    if (workspaceName) {
      // 获取特定工作区的数据
      const data = await getWorkspaceData(workspaceName)
      if (!data) {
        return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
      }
      return NextResponse.json(data)
    } else {
      // 获取所有工作区列表
      const workspaces = await getWorkspaces()
      return NextResponse.json(workspaces)
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: 创建新工作区
export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json()
    
    if (!name) {
      return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 })
    }

    const workspaces = await getWorkspaces()
    
    // 检查工作区是否已存在
    if (workspaces.find(w => w.name === name)) {
      return NextResponse.json({ error: 'Workspace already exists' }, { status: 409 })
    }

    const newWorkspace: Workspace = {
      name,
      description: description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    workspaces.push(newWorkspace)
    await saveWorkspaces(workspaces)

    return NextResponse.json(newWorkspace, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: 更新工作区数据
export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const workspaceName = searchParams.get('name')
  
  if (!workspaceName) {
    return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 })
  }

  try {
    const data: WorkspaceData = await request.json()
    
    // 验证工作区是否存在
    const workspaces = await getWorkspaces()
    const workspace = workspaces.find(w => w.name === workspaceName)
    
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    await saveWorkspaceData(workspaceName, data)
    
    // 更新工作区的 updatedAt 时间
    workspace.updatedAt = new Date().toISOString()
    await saveWorkspaces(workspaces)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: 删除工作区
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const workspaceName = searchParams.get('name')
  
  if (!workspaceName) {
    return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 })
  }

  if (workspaceName === 'default') {
    return NextResponse.json({ error: 'Cannot delete default workspace' }, { status: 400 })
  }

  try {
    const workspaces = await getWorkspaces()
    const filteredWorkspaces = workspaces.filter(w => w.name !== workspaceName)
    
    if (filteredWorkspaces.length === workspaces.length) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    await saveWorkspaces(filteredWorkspaces)
    
    // 删除工作区文件夹
    const workspaceDir = path.join(WORKSPACES_DIR, workspaceName)
    try {
      await fs.rm(workspaceDir, { recursive: true, force: true })
    } catch {
      // 忽略删除文件夹的错误
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 