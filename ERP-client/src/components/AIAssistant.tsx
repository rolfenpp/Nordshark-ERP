import { useState, useEffect, useRef } from 'react'
import { 
  Box, 
  TextField, 
  Paper, 
  Typography, 
  Button, 
  Chip, 
  IconButton, 
  CircularProgress, 
  useTheme, 
  useMediaQuery,
  Fade,
  Slide,
  Fab,
  Card,
  CardContent,
  Stack,
  Avatar,
  Tooltip
} from '@mui/material'
import {
  AutoAwesome as MagicIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  History as HistoryIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material'
import { useAuth } from '@/auth/AuthProvider'
import { askAI } from '@/lib/ai'

interface Message {
  id: string
  question: string
  answer: string
  timestamp: Date
}

export const AIAssistant = () => {
  const { isAuthenticated } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [isOpen, setIsOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversation, setConversation] = useState<Message[]>([])
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [displayedAnswer, setDisplayedAnswer] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const responseContainerRef = useRef<HTMLDivElement>(null)

  const handleAsk = async () => {
    if (!question.trim()) return
    
    setLoading(true)
    const context = {
      currentPage: window.location.pathname,
      currentUser: isAuthenticated ? 'Authenticated User' : 'Guest',
      availableFeatures: ['inventory', 'invoices', 'projects', 'users'],
      userPermissions: isAuthenticated ? 'Standard' : 'Guest'
    }
    
    try {
      const response = await askAI(question, context)
      setAnswer(response || '')
      
      const newMessage: Message = {
        id: Date.now().toString(),
        question: question,
        answer: response || '',
        timestamp: new Date()
      }
      setConversation(prev => [newMessage, ...prev.slice(0, 4)])
      
      setQuestion('')
      setShowSuggestions(false)
    } catch (error) {
      setAnswer('Sorry, I encountered an error. Please try again.')
    }
    setLoading(false)
  }

  const getQuickActions = () => {
    const page = window.location.pathname
    if (page.includes('inventory')) {
      return [
        { label: "Create Item", action: () => window.location.href = '/inventory/create', icon: "📦" },
        { label: "View Items", action: () => window.location.href = '/inventory', icon: "👁️" },
        { label: "Import CSV", action: () => window.location.href = '/inventory', icon: "📊" }
      ]
    } else if (page.includes('invoices')) {
      return [
        { label: "New Invoice", action: () => window.location.href = '/invoices/create', icon: "📄" },
        { label: "View Invoices", action: () => window.location.href = '/invoices', icon: "📋" },
        { label: "Payment Status", action: () => window.location.href = '/invoices', icon: "💰" }
      ]
    } else if (page.includes('projects')) {
      return [
        { label: "New Project", action: () => window.location.href = '/projects/create', icon: "🚀" },
        { label: "View Projects", action: () => window.location.href = '/projects', icon: "📁" },
        { label: "Task Management", action: () => window.location.href = '/projects', icon: "✅" }
      ]
    }
    return [
      { label: "Inventory", action: () => window.location.href = '/inventory', icon: "📦" },
      { label: "Invoices", action: () => window.location.href = '/invoices', icon: "📄" },
      { label: "Projects", action: () => window.location.href = '/projects', icon: "🚀" }
    ]
  }

  const quickActions = getQuickActions()

  useEffect(() => {
    if (answer && answer !== displayedAnswer && !isTyping) {
      setIsTyping(true)
      setDisplayedAnswer('')
      let index = 0
      
      const typeWriter = () => {
        if (index < answer.length) {
          setDisplayedAnswer(prev => prev + answer[index])
          index++
          
          setTimeout(() => {
            if (responseContainerRef.current) {
              responseContainerRef.current.scrollTop = responseContainerRef.current.scrollHeight
            }
          }, 10)
          
          setTimeout(typeWriter, 30)
        } else {
          setIsTyping(false)
        }
      }
      
      typeWriter()
    }
  }, [answer])

  const handleClose = () => {
    setIsOpen(false)
    setAnswer('')
    setDisplayedAnswer('')
    setIsTyping(false)
  }

  const handleClearHistory = () => {
    setConversation([])
    setShowSuggestions(true)
    setAnswer('')
    setDisplayedAnswer('')
    setIsTyping(false)
  }

  return (
    <>
       <Fade in={true}>
         <Fab
           onClick={() => setIsOpen(!isOpen)}
          sx={{
            position: 'fixed',
            bottom: theme.spacing(2),
            right: theme.spacing(2),
            zIndex: theme.zIndex.fab,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[12],
            },
            transition: theme.transitions.create(['transform', 'box-shadow'], {
              duration: theme.transitions.duration.standard,
            }),
          }}
          size="large"
                 >
           {isOpen ? <CloseIcon /> : <MagicIcon />}
         </Fab>
      </Fade>

      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={24}
          sx={{
            position: 'fixed',
            bottom: isMobile ? theme.spacing(2) : theme.spacing(12),
            right: isMobile ? 0 : theme.spacing(2),
            left: isMobile ? 0 : 'auto',
            width: isMobile ? '100%' : 400,
            height: 600,
            zIndex: theme.zIndex.modal,
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: theme.palette.primary.contrastText,
              p: theme.spacing(2),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MagicIcon />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                AI Assistant
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Clear history">
                <IconButton
                  onClick={handleClearHistory}
                  size="small"
                  sx={{ 
                    color: theme.palette.primary.contrastText,
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Close">
                <IconButton
                  onClick={handleClose}
                  size="small"
                  sx={{ 
                    color: theme.palette.primary.contrastText,
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {showSuggestions && (
              <Card sx={{ m: 2, background: theme.palette.action.hover }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <LightbulbIcon color="primary" fontSize="small" />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                      Quick Actions
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {quickActions.map((action, index) => (
                      <Chip
                        key={index}
                        label={action.label}
                        onClick={action.action}
                        icon={<span>{action.icon}</span>}
                        size="small"
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { 
                            background: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                          },
                          transition: theme.transitions.create(['background-color', 'color']),
                        }}
                      />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}

            {displayedAnswer && (
              <Box ref={responseContainerRef} sx={{ mx: 2, mb: 2, maxHeight: 300, overflow: 'auto' }}>
                <Card sx={{ background: theme.palette.background.default }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        }}
                      >
                        <MagicIcon fontSize="small" />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {displayedAnswer}
                          {isTyping && (
                            <Box
                              component="span"
                              sx={{
                                display: 'inline-block',
                                width: 2,
                                height: 16,
                                background: theme.palette.primary.main,
                                ml: 0.5,
                                animation: 'blink 1s infinite',
                                '@keyframes blink': {
                                  '0%, 50%': { opacity: 1 },
                                  '51%, 100%': { opacity: 0 },
                                },
                              }}
                            />
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}

            {conversation.length > 0 && (
              <Box sx={{ flex: 1, overflow: 'auto', px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <HistoryIcon color="action" fontSize="small" />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                    Recent Questions
                  </Typography>
                </Box>
                <Stack spacing={1}>
                  {conversation.slice(1).map((msg) => (
                    <Card
                      key={msg.id}
                      variant="outlined"
                      sx={{
                        background: theme.palette.action.hover,
                        '&:hover': { background: theme.palette.action.selected },
                        cursor: 'pointer',
                        transition: theme.transitions.create('background-color'),
                      }}
                      onClick={() => {
                        setQuestion(msg.question)
                        setAnswer(msg.answer)
                        setDisplayedAnswer(msg.answer)
                        setIsTyping(false)
                      }}
                    >
                      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          {msg.question}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            )}

            <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Ask me anything..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                  variant="outlined"
                  size="small"
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius,
                    },
                  }}
                />
                <Button
                  onClick={handleAsk}
                  disabled={loading || !question.trim()}
                  variant="contained"
                  size="small"
                  sx={{
                    minWidth: 'unset',
                    px: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                    },
                    '&:disabled': {
                      background: theme.palette.action.disabledBackground,
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SendIcon fontSize="small" />
                  )}
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Slide>
    </>
  )
}