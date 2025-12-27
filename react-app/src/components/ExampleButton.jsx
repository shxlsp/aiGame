import styled from 'styled-components'
import { motion } from 'framer-motion'

const Button = styled(motion.button)`
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
`

const ExampleButton = ({ children, onClick }) => {
  return (
    <Button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

export default ExampleButton

