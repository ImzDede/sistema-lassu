import React from 'react';
import Link from 'next/link';

interface NavItemProps {
  icon: React.ReactElement;
  label: string;
  href: string;      // Adicionei href para saber pra onde ir
  active?: boolean;
}

const NavItem = ({ icon, label, href, active = false }: NavItemProps) => {
  return (
    <Link 
      href={href} 
      className={`
        flex items-center gap-4 px-6 py-4 
        cursor-pointer transition-colors
        hover:bg-gray-300 
        ${active ? 'bg-gray-300 font-bold' : ''}
      `}
    >
      {/* O cloneElement garante que o ícone receba as classes de tamanho */}
      {React.cloneElement(icon as React.ReactElement<{ className: string }>, { className: "w-6 h-6" })}
      
      <span className="uppercase text-sm tracking-wide text-black">{label}</span>
    </Link>
  );
};

export default NavItem;