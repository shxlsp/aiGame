import { useState, lazy, Suspense } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

// 动态导入 pages 目录下的所有组件
const pageModules = import.meta.glob('./pages/*.jsx')

// 创建页面配置
const pages = Object.keys(pageModules).map(path => {
  const fileName = path.replace('./pages/', '').replace('.jsx', '')
  return {
    name: fileName,
    component: lazy(() => import(`./pages/${fileName}.jsx`))
  }
})

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #0a0a0a;
  overflow: hidden;
`

const TabBarWrapper = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
`

const TabBar = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  padding-right: 4rem;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
`

const ToggleButton = styled(motion.button)`
  position: fixed;
  right: 1rem;
  top: 1rem;
  z-index: 10000;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(118, 75, 162, 0.9);
    box-shadow: 0 6px 20px rgba(118, 75, 162, 0.5);
  }
`

const TabButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: ${props => props.$active ? '#fff' : 'rgba(255, 255, 255, 0.6)'};
  background: ${props => props.$active 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.$active 
    ? 'transparent' 
    : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.$active 
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      : 'rgba(255, 255, 255, 0.1)'};
    color: #fff;
  }
`

const ContentArea = styled.div`
  flex: 1;
  overflow: auto;
  position: relative;
  width: 100%;
  height: 100%;
  padding-top: ${props => props.$isCollapsed ? '0' : '68px'};
  transition: padding-top 0.3s ease;
`

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: white;
  font-size: 1.2rem;
`

const Spinner = styled(motion.div)`
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: rgba(255, 255, 255, 0.6);
  gap: 1rem;
  
  h2 {
    font-size: 2rem;
    margin: 0;
  }
  
  p {
    font-size: 1.1rem;
    margin: 0;
  }
`

function App() {
  const [activeTab, setActiveTab] = useState(pages.length > 0 ? pages[0].name : null)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const ActiveComponent = pages.find(page => page.name === activeTab)?.component

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.3 }
    }
  }

  const tabBarVariants = {
    expanded: { 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    collapsed: { 
      y: -100,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  }

  return (
    <Container>
      {pages.length > 0 ? (
        <>
          <TabBarWrapper
            variants={tabBarVariants}
            initial="expanded"
            animate={isCollapsed ? "collapsed" : "expanded"}
          >
            <TabBar>
              {pages.map((page) => (
                <TabButton
                  key={page.name}
                  $active={activeTab === page.name}
                  onClick={() => setActiveTab(page.name)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {page.name}
                </TabButton>
              ))}
            </TabBar>
          </TabBarWrapper>

          <ToggleButton
            onClick={() => setIsCollapsed(!isCollapsed)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={isCollapsed ? "展开导航栏" : "收起导航栏"}
          >
            {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </ToggleButton>

          <ContentArea $isCollapsed={isCollapsed}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ minHeight: '100%' }}
              >
                <Suspense 
                  fallback={
                    <LoadingContainer>
                      <Spinner
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    </LoadingContainer>
                  }
                >
                  {ActiveComponent && <ActiveComponent />}
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </ContentArea>
        </>
      ) : (
        <EmptyState>
          <h2>📁 暂无页面</h2>
          <p>请在 src/pages 目录下创建组件文件</p>
        </EmptyState>
      )}
    </Container>
  )
}

export default App

