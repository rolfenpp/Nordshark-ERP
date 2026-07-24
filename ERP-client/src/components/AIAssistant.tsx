import { useState } from 'react'
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
  Tooltip,
} from '@mui/material'
import {
  AutoAwesome as MagicIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  History as HistoryIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material'
import { useNavigate } from '@tanstack/react-router'
import { useAiHelp } from '@/api/ai'
import { aiAssistantQuestionSchema } from '@/schemas/ai'
import { showZodError } from '@/lib/zodToast'
import { plainAiText } from '@/lib/plainAiText'

interface Message {
  id: string
  question: string
  answer: string
  timestamp: Date
}

export const AIAssistant = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const help = useAiHelp()
  const [isOpen, setIsOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [conversation, setConversation] = useState<Message[]>([])
  const [showSuggestions, setShowSuggestions] = useState(true)

  const handleAsk = async () => {
    const parsed = aiAssistantQuestionSchema.safeParse({ question })
    if (!parsed.success) {
      showZodError(parsed.error)
      return
    }
    const trimmed = parsed.data.question

    try {
      const response = await help.mutateAsync({
        question: trimmed,
        currentRoute: window.location.pathname,
      })
      const text = plainAiText(response.answer || '')
      setAnswer(text)
      setConversation((prev) => [
        {
          id: Date.now().toString(),
          question: trimmed,
          answer: text,
          timestamp: new Date(),
        },
        ...prev.slice(0, 4),
      ])
      setQuestion('')
      setShowSuggestions(false)
    } catch {
      setAnswer('Sorry, I encountered an error. Please try again.')
    }
  }

  const getQuickActions = () => {
    const page = window.location.pathname
    if (page.includes('inventory')) {
      return [
        { label: 'Create Item', action: () => navigate({ to: '/inventory/create' }) },
        { label: 'View Items', action: () => navigate({ to: '/inventory' }) },
      ]
    }
    if (page.includes('invoices')) {
      return [
        { label: 'New Invoice', action: () => navigate({ to: '/invoices/create' }) },
        { label: 'View Invoices', action: () => navigate({ to: '/invoices' }) },
      ]
    }
    if (page.includes('projects')) {
      return [
        { label: 'New Project', action: () => navigate({ to: '/projects/create' }) },
        { label: 'View Projects', action: () => navigate({ to: '/projects' }) },
      ]
    }
    return [
      { label: 'Inventory', action: () => navigate({ to: '/inventory' }) },
      { label: 'Invoices', action: () => navigate({ to: '/invoices' }) },
      { label: 'Projects', action: () => navigate({ to: '/projects' }) },
    ]
  }

  const quickActions = getQuickActions()
  const loading = help.isPending

  const handleClose = () => {
    setIsOpen(false)
    setAnswer('')
  }

  const handleClearHistory = () => {
    setConversation([])
    setShowSuggestions(true)
    setAnswer('')
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
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
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
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
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
                    {quickActions.map((action) => (
                      <Chip
                        key={action.label}
                        label={action.label}
                        onClick={action.action}
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

            {(loading || answer) && (
              <Box sx={{ mx: 2, mb: 2, maxHeight: 300, overflow: 'auto' }}>
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
                        {loading ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                            <CircularProgress size={18} />
                            <Typography variant="body2" color="text.secondary">
                              Thinking…
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            {answer}
                          </Typography>
                        )}
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
                        setAnswer(plainAiText(msg.answer))
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
                  placeholder="Ask how to navigate…"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                  variant="outlined"
                  size="small"
                  disabled={loading}
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
                  {loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon fontSize="small" />}
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Slide>
    </>
  )
}
