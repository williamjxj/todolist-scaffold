import { FloatingMenu, FloatingMenuOption } from './ui/floating-menu'
import { Plus, Edit, Trash2, Save, Settings, Home, User, FileText, Share2, X, Sparkles } from 'lucide-react'
import { ColourfulText } from './ui/colourful-text'

export const FloatingMenuDemo = () => {
  const options: FloatingMenuOption[] = [
    {
      id: 'add',
      label: 'Add New',
      icon: <Plus />,
      onClick: () => {
        console.log('Add clicked')
        alert('Add action triggered!')
      },
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Edit />,
      onClick: () => {
        console.log('Edit clicked')
        alert('Edit action triggered!')
      },
    },
    {
      id: 'save',
      label: 'Save',
      icon: <Save />,
      onClick: () => {
        console.log('Save clicked')
        alert('Save action triggered!')
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 />,
      onClick: () => {
        console.log('Delete clicked')
        alert('Delete action triggered!')
      },
      className: 'hover:border-red-500 hover:text-red-600',
    },
  ]

  const quickActions: FloatingMenuOption[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home />,
      onClick: () => alert('Home'),
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User />,
      onClick: () => alert('Profile'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings />,
      onClick: () => alert('Settings'),
    },
  ]

  const documentActions: FloatingMenuOption[] = [
    {
      id: 'new',
      label: 'New Document',
      icon: <FileText />,
      onClick: () => alert('New Document'),
    },
    {
      id: 'save',
      label: 'Save',
      icon: <Save />,
      onClick: () => alert('Save'),
    },
    {
      id: 'share',
      label: 'Share',
      icon: <Share2 />,
      onClick: () => alert('Share'),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="ticker-container bg-white py-12 mb-12 border-y border-gray-100 -mx-8">
        <div className="ticker-content flex items-center gap-12 whitespace-nowrap">
          {/* Copy 1 */}
          <div className="flex items-center gap-12 text-5xl md:text-7xl font-black text-gray-950 uppercase tracking-tighter shrink-0">
            <span>Todo List Scaffold</span>
            <div className="w-16 h-1 border-t-8 border-purple-600 rounded-full" />
            <span>Smooth Spring Animations</span>
            <Plus className="w-12 h-12 md:w-16 md:h-16 text-purple-600" />
            <span>Quarter Circle Arc</span>
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-blue-500 border-dotted" />
            <span>Fully Customizable</span>
            <Settings className="w-12 h-12 md:w-16 md:h-16 text-gray-400" />
            <span>No Backdrop</span>
            <X className="w-12 h-12 md:w-16 md:h-16 text-orange-500" />
            <span>Premium UI</span>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-100 rounded-2xl rotate-12 flex items-center justify-center">
              <FileText className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
            </div>
          </div>
          {/* Copy 2 (Seamless loop) */}
          <div className="flex items-center gap-12 text-5xl md:text-7xl font-black text-gray-950 uppercase tracking-tighter shrink-0">
            <span>Todo List Scaffold</span>
            <div className="w-16 h-1 border-t-8 border-purple-600 rounded-full" />
            <span>Smooth Spring Animations</span>
            <Plus className="w-12 h-12 md:w-16 md:h-16 text-purple-600" />
            <span>Quarter Circle Arc</span>
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-blue-500 border-dotted" />
            <span>Fully Customizable</span>
            <Settings className="w-12 h-12 md:w-16 md:h-16 text-gray-400" />
            <span>No Backdrop</span>
            <X className="w-12 h-12 md:w-16 md:h-16 text-orange-500" />
            <span>Premium UI</span>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-100 rounded-2xl rotate-12 flex items-center justify-center">
              <FileText className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/50 backdrop-blur-md border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
          <span className="text-gray-600 font-medium tracking-tight">
            Crafted with passion by <span className="text-gray-950 font-black"><ColourfulText text="William Jiang" /></span>
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Compact floating menu - no fullscreen backdrop</li>
            <li>Smooth spring animations for menu appearance</li>
            <li>Options slide in from the side with stagger effect</li>
            <li>Click outside to close</li>
            <li>Customizable position (4 corners) and size</li>
            <li>Hover effects with scale and slide animations</li>
            <li>Main button rotates smoothly when opened</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Bottom Right (Default)</h3>
            <p className="text-sm text-gray-600 mb-4">Standard position with medium size</p>
            <div className="relative h-96 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <FloatingMenu
                options={options}
                position="bottom-right"
                size="md"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Bottom Left</h3>
            <p className="text-sm text-gray-600 mb-4">Options slide from the right</p>
            <div className="relative h-96 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <FloatingMenu
                options={quickActions}
                position="bottom-left"
                size="md"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Top Right - Small</h3>
            <p className="text-sm text-gray-600 mb-4">Compact size for less space</p>
            <div className="relative h-96 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <FloatingMenu
                options={documentActions}
                position="top-right"
                size="sm"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Top Left - Large</h3>
            <p className="text-sm text-gray-600 mb-4">Larger buttons for better visibility</p>
            <div className="relative h-96 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <FloatingMenu
                options={options.slice(0, 3)}
                position="top-left"
                size="lg"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Usage Example</h2>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <code>{`import { FloatingMenu } from './components/ui/floating-menu'
import { Plus, Edit, Save } from 'lucide-react'

const options = [
  {
    id: 'add',
    label: 'Add New',
    icon: <Plus />,
    onClick: () => console.log('Add clicked'),
  },
  {
    id: 'edit',
    label: 'Edit',
    icon: <Edit />,
    onClick: () => console.log('Edit clicked'),
  },
]

<FloatingMenu
  options={options}
  position="bottom-right"
  size="md"
/>`}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
