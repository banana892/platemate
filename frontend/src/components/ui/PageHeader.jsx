import React from 'react'

export function PageHeader({ title, description, breadcrumbs, actions, className = '' }) {
  return (
    <div className={`mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-5 ${className}`}>
      <div>
        {breadcrumbs && (
          <nav className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span>/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-[#FF4F5A] transition-colors">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">{title}</h1>
        {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
    </div>
  )
}

export default PageHeader
