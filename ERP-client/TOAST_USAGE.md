# React Toastify Usage Guide

This application uses React Toastify for showing toast notifications throughout the user interface.

## 🚀 Quick Start

### 1. Basic Usage

```typescript
import { showSuccess, showError, showWarning, showInfo } from '../lib/toast'

// Show success message
showSuccess('Operation completed successfully!')

// Show error message
showError('Something went wrong')

// Show warning message
showWarning('Please review your input')

// Show info message
showInfo('Here is some information')
```

### 2. Custom Toast

```typescript
import { showToast } from '../lib/toast'

// Custom toast with options
showToast('Custom message', 'success', {
  autoClose: 10000,        // 10 seconds
  position: 'bottom-center',
  hideProgressBar: true
})
```

## 📍 Available Functions

### `showSuccess(message: string)`
- **Purpose**: Show success notifications
- **Auto-close**: 3 seconds
- **Color**: Green
- **Use case**: Successful operations, confirmations

### `showError(message: string)`
- **Purpose**: Show error notifications
- **Auto-close**: 5 seconds
- **Color**: Red
- **Use case**: Failed operations, validation errors

### `showWarning(message: string)`
- **Purpose**: Show warning notifications
- **Auto-close**: 4 seconds
- **Color**: Orange
- **Use case**: Warnings, important notices

### `showInfo(message: string)`
- **Purpose**: Show informational notifications
- **Auto-close**: 4 seconds
- **Color**: Blue
- **Use case**: General information, tips

### `showToast(message, type, options?)`
- **Purpose**: Custom toast with full control
- **Parameters**:
  - `message`: The message to display
  - `type`: 'success' | 'error' | 'warning' | 'info'
  - `options`: Custom options (optional)

## ⚙️ Configuration

### Global Settings (in main.tsx)
```typescript
<ToastContainer
  position="top-right"        // Position on screen
  autoClose={5000}           // Auto-close after 5 seconds
  hideProgressBar={false}    // Show progress bar
  newestOnTop={false}        // New toasts appear below
  closeOnClick={true}        // Close when clicked
  rtl={false}                // Right-to-left support
  pauseOnFocusLoss={true}    // Pause when window loses focus
  draggable={true}           // Allow dragging
  pauseOnHover={true}        // Pause on hover
  theme="light"              // Light theme
/>
```

### Custom Options
```typescript
const customOptions = {
  position: 'bottom-center' as const,
  autoClose: 10000,
  hideProgressBar: true,
  closeOnClick: false,
  draggable: false
}

showToast('Message', 'success', customOptions)
```

## 🎯 Common Use Cases

### 1. Form Submissions
```typescript
const handleSubmit = async (data: FormData) => {
  try {
    await api.createItem(data)
    showSuccess('Item created successfully!')
    navigate('/inventory')
  } catch (error) {
    showError('Failed to create item. Please try again.')
  }
}
```

### 2. API Operations
```typescript
const createMutation = useCreateInventoryItem()

// In your mutation hook
onSuccess: (newItem) => {
  showSuccess(`Item "${newItem.name}" created successfully!`)
  // ... other logic
},
onError: (error) => {
  showError(error.message || 'Failed to create item')
}
```

### 3. User Actions
```typescript
const handleDelete = async (id: number) => {
  try {
    await api.deleteItem(id)
    showSuccess('Item deleted successfully!')
    refreshList()
  } catch (error) {
    showError('Failed to delete item')
  }
}
```

### 4. Validation Errors
```typescript
const handleValidationError = (errors: ValidationErrors) => {
  const errorMessage = Object.entries(errors)
    .map(([field, message]) => `${field}: ${message}`)
    .join('; ')
  
  showError(`Validation failed: ${errorMessage}`)
}
```

## 🔧 Integration Examples

### With React Query
```typescript
export const useCreateItem = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.createItem,
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      showSuccess(`Item "${newItem.name}" created!`)
    },
    onError: (error: any) => {
      showError(error.message || 'Failed to create item')
    }
  })
}
```

### With Form Libraries
```typescript
const { handleSubmit } = useForm({
  resolver: zodResolver(schema)
})

const onSubmit = handleSubmit((data) => {
  // Your submission logic
  showSuccess('Form submitted successfully!')
}, (errors) => {
  showError('Please fix the errors in the form')
})
```

### With Event Handlers
```typescript
const handleCopyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showSuccess('Copied to clipboard!')
  } catch {
    showError('Failed to copy to clipboard')
  }
}
```

## 🎨 Styling & Customization

### Custom CSS (if needed)
```css
/* Custom toast styles */
.Toastify__toast {
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
}

.Toastify__toast--success {
  background: linear-gradient(135deg, #4caf50, #45a049);
}

.Toastify__toast--error {
  background: linear-gradient(135deg, #f44336, #d32f2f);
}
```

### Position Options
- `top-right` (default)
- `top-center`
- `top-left`
- `bottom-right`
- `bottom-center`
- `bottom-left`

### Auto-close Options
- `false` - Never auto-close
- `number` - Close after X milliseconds
- `true` - Use default timing

## 🚫 Common Mistakes to Avoid

### 1. Don't show toasts in useEffect without dependencies
```typescript
// ❌ Bad - will show toast on every render
useEffect(() => {
  showSuccess('Welcome!')
}, [])

// ✅ Good - only shows when user changes
useEffect(() => {
  if (user) {
    showSuccess(`Welcome back, ${user.name}!`)
  }
}, [user])
```

### 2. Don't show toasts for every minor action
```typescript
// ❌ Bad - too many toasts
const handleInputChange = () => {
  showInfo('Input changed') // Too frequent
}

// ✅ Good - only for important actions
const handleSave = () => {
  showSuccess('Changes saved successfully!')
}
```

### 3. Don't forget error handling
```typescript
// ❌ Bad - no error feedback
const handleSubmit = async () => {
  await api.submit()
  // What if it fails?
}

// ✅ Good - proper error handling
const handleSubmit = async () => {
  try {
    await api.submit()
    showSuccess('Submitted successfully!')
  } catch (error) {
    showError('Submission failed. Please try again.')
  }
}
```

## 📱 Mobile Considerations

- Toasts automatically adjust for mobile screens
- Touch-friendly close buttons
- Swipe gestures work on mobile
- Responsive positioning

## 🔍 Debugging

### Check if toasts are working
1. Verify `ToastContainer` is in main.tsx
2. Check console for errors
3. Ensure CSS is imported: `import 'react-toastify/dist/ReactToastify.css'`

### Common issues
- Toasts not showing: Check if `ToastContainer` is rendered
- Styling issues: Verify CSS import
- Position problems: Check `position` prop value

## 📚 Additional Resources

- [React Toastify Documentation](https://fkhadra.github.io/react-toastify/)
- [Toastify Options Reference](https://fkhadra.github.io/react-toastify/api/toast)
- [Position Examples](https://fkhadra.github.io/react-toastify/position)

---

**Happy toasting! 🍞✨**
