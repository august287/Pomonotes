# Pompompurin's Productivity Palace - Project Rules & Guidelines

## 🎯 Project Overview

A productivity app featuring Pomodoro timer, note-taking, and expense tracking with a Pompompurin (golden retriever) theme.

## 🛠️ Technical Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS Variables
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Data Storage**: localStorage (client-side)

## 📁 Project Structure Rules

### Directory Organization

```
/app/
  ├── layout.tsx          # Root layout with metadata
  ├── page.tsx           # Main application page
  └── globals.css        # Global styles and CSS variables

/components/ui/
  ├── button.tsx         # Reusable button component
  ├── card.tsx          # Card components (Card, CardHeader, etc.)
  ├── input.tsx         # Input component
  ├── textarea.tsx      # Textarea component
  ├── tabs.tsx          # Tab components
  └── badge.tsx         # Badge component

/lib/
  └── utils.ts          # Utility functions (cn helper)

Configuration Files:
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── tailwind.config.js # Tailwind CSS configuration
├── postcss.config.js  # PostCSS configuration
└── next.config.js     # Next.js configuration
```

## 🎨 Design System Rules

### Color Palette (Pompompurin Theme)

- **Primary Background**: `#fefcac` (cream yellow)
- **Primary Text**: `#a65c18` (warm brown)
- **Card Background**: `#fff9e6` (light cream)
- **Accent**: `#f5e6a3` (golden yellow)
- **Border**: `#a65c18` (warm brown)

### Typography

- **Primary Font**: Frankfurter (cursive) for ALL text elements
- **Font Consistency**: Use Frankfurter throughout the entire application for full theme immersion
- **Font Sizes**: Use Tailwind classes (`text-xl`, `text-3xl`, etc.)

### Component Styling

- All cards use `border-2` with `borderColor: '#a65c18'`
- Card backgrounds use `backgroundColor: '#fff9e6'`
- Primary buttons use `backgroundColor: '#a65c18'` and `color: '#fefcac'`
- Maintain consistent spacing with Tailwind classes

## 📱 Responsive Design Rules

### Breakpoint Strategy

- **Mobile First**: Design for mobile, enhance for larger screens
- **Breakpoints**: Use Tailwind's `sm:`, `md:`, `lg:`, `xl:` prefixes
- **Grid Layouts**: Use responsive grid classes (`grid-cols-1 sm:grid-cols-2 md:grid-cols-3`)

### Mobile Optimizations

- Stack buttons vertically on mobile (`flex-col sm:flex-row`)
- Adjust text sizes (`text-3xl sm:text-4xl md:text-6xl`)
- Use full width buttons on mobile (`w-full sm:w-auto`)
- Reduce padding on mobile (`p-2 sm:p-4`)

## 🔧 Code Quality Rules

### TypeScript Standards

- Use strict TypeScript configuration
- Define interfaces for all data structures (`Note`, `Expense`)
- Use proper typing for React components and props
- Avoid `any` types

### React Best Practices

- Use functional components with hooks
- Implement proper state management with useState
- Use useEffect for side effects and cleanup
- Follow React naming conventions (PascalCase for components)

### Component Structure

- Keep components focused and single-responsibility
- Use consistent prop destructuring
- Implement proper error handling
- Use React.forwardRef for UI components

## 💾 Data Management Rules

### localStorage Standards

- Use consistent naming: `"pompompurin-[feature]"` pattern
- Implement proper JSON serialization/deserialization
- Handle localStorage availability checks
- Provide fallback for missing data

### State Management

- Use appropriate state structure (arrays for lists, objects for complex data)
- Implement proper state updates (immutable patterns)
- Use functional state updates when depending on previous state
- Clear form inputs after successful submissions

## 🎮 Feature Implementation Rules

### Pomodoro Timer

- Default: 25 minutes focus, 5 minutes break
- Persist timer state in localStorage
- Show completion count
- Provide audio/visual feedback for transitions

### Notes System

- Required fields: title, content
- Auto-generate ID using timestamp
- Store creation date
- Implement CRUD operations (Create, Read, Delete)
- Support multiline content with `whitespace-pre-wrap`

### Expense Tracker

- Required fields: description, amount, category
- Validate numeric input for amounts
- Calculate and display totals
- Format currency display (2 decimal places)
- Store transaction date

## 🚀 Performance Rules

### Optimization Guidelines

- Use React.memo for expensive components (if needed)
- Implement proper cleanup in useEffect
- Avoid unnecessary re-renders
- Optimize localStorage operations

### Bundle Size

- Use tree-shaking friendly imports
- Avoid importing entire libraries when possible
- Use dynamic imports for heavy components (if needed)

## 🎯 User Experience Rules

### Interaction Design

- Provide immediate feedback for user actions
- Use consistent button styles and behaviors
- Implement hover states for interactive elements
- Show loading states for async operations

### Content Strategy

- Use Pompompurin-themed emojis and messaging
- Maintain friendly, encouraging tone
- Provide helpful placeholder text
- Show empty states with guidance

## 🧪 Testing Guidelines

### Component Testing

- Test core functionality (timer, CRUD operations)
- Verify localStorage persistence
- Test responsive behavior
- Validate form submissions

### Browser Compatibility

- Support modern browsers (Chrome, Firefox, Safari, Edge)
- Test localStorage availability
- Ensure responsive design works across devices

## 📦 Deployment Rules

### Build Process

- Use `npm run build` for production builds
- Verify all TypeScript errors are resolved
- Test production build locally before deployment
- Optimize assets and images

### Version Control

- Use semantic commit messages
- Create feature branches for new functionality
- Review code before merging
- Tag releases appropriately

## 🔒 Security Guidelines

### Client-Side Security

- Validate all user inputs
- Sanitize content before storage
- Handle XSS prevention (React handles most)
- Be cautious with dangerouslySetInnerHTML

### Data Privacy

- Keep all data client-side (localStorage)
- No external data transmission
- Respect user privacy
- Provide clear data usage information

## 🎨 Theme Consistency Rules

### Visual Elements

- Use dog/Pompompurin emojis throughout (🐶, 🍅, ☕, 🎉, 💪, etc.)
- Maintain warm, friendly color scheme
- Use consistent border radius and shadows
- Keep spacing consistent with Tailwind scale

### Content Tone

- Encouraging and motivational messages
- Pompompurin personality references
- Fun but professional interface
- Clear, concise instructions

---

## 📝 Development Checklist

When adding new features, ensure:

- [ ] Follows established color scheme
- [ ] Responsive design implemented
- [ ] TypeScript types defined
- [ ] localStorage persistence (if applicable)
- [ ] Error handling implemented
- [ ] Consistent with existing patterns
- [ ] Tested across devices
- [ ] Accessibility considerations
- [ ] Performance optimized
- [ ] Documentation updated

---

_Last Updated: August 8, 2025_
_Version: 1.0.0_
