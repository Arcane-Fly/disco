import{B as e}from"./Button-PbzTXW9l.js";import"./index-D4j2QUWo.js";const B={title:"UI/Button",component:e,parameters:{layout:"centered",docs:{description:{component:`Button Component

A versatile button component with multiple variants, sizes, and states.
Supports loading states and icons.`}}},tags:["autodocs"],argTypes:{variant:{control:"select",options:["primary","secondary","outline","ghost","destructive"],description:"Visual style variant of the button"},size:{control:"select",options:["sm","md","lg","xl"],description:"Size of the button"},isLoading:{control:"boolean",description:"Shows loading spinner and disables interaction"},disabled:{control:"boolean",description:"Disables the button"}}},t={args:{variant:"primary",children:"Primary Button"}},r={args:{variant:"secondary",children:"Secondary Button"}},a={args:{variant:"outline",children:"Outline Button"}},s={args:{variant:"ghost",children:"Ghost Button"}},o={args:{variant:"destructive",children:"Delete"}},n={args:{size:"sm",children:"Small Button"}},i={args:{size:"md",children:"Medium Button"}},c={args:{size:"lg",children:"Large Button"}},d={args:{size:"xl",children:"Extra Large Button"}},l={args:{isLoading:!0,children:"Click me"}},m={args:{disabled:!0,children:"Disabled Button"}},u={args:{children:"Download",leftIcon:React.createElement("svg",{width:"16",height:"16",viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg"},React.createElement("path",{d:"M8 12L3 7L4.4 5.6L7 8.2V0H9V8.2L11.6 5.6L13 7L8 12Z",fill:"currentColor"}),React.createElement("path",{d:"M0 14H16V16H0V14Z",fill:"currentColor"}))}},p={args:{children:"Continue",rightIcon:React.createElement("svg",{width:"16",height:"16",viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg"},React.createElement("path",{d:"M8 0L13 5L11.6 6.4L9 3.8V16H7V3.8L4.4 6.4L3 5L8 0Z",fill:"currentColor",transform:"rotate(90 8 8)"}))}},g={args:{children:"Default"},render:()=>React.createElement("div",{className:"flex flex-col gap-4"},React.createElement("div",{className:"flex gap-4"},React.createElement(e,{variant:"primary"},"Primary"),React.createElement(e,{variant:"secondary"},"Secondary"),React.createElement(e,{variant:"outline"},"Outline"),React.createElement(e,{variant:"ghost"},"Ghost"),React.createElement(e,{variant:"destructive"},"Destructive")),React.createElement("div",{className:"flex gap-4"},React.createElement(e,{size:"sm"},"Small"),React.createElement(e,{size:"md"},"Medium"),React.createElement(e,{size:"lg"},"Large"),React.createElement(e,{size:"xl"},"Extra Large")),React.createElement("div",{className:"flex gap-4"},React.createElement(e,{isLoading:!0},"Loading"),React.createElement(e,{disabled:!0},"Disabled")))};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'primary',
    children: 'Primary Button'
  }
}`,...t.parameters?.docs?.source},description:{story:"Primary button - Main call-to-action",...t.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'secondary',
    children: 'Secondary Button'
  }
}`,...r.parameters?.docs?.source},description:{story:"Secondary button - Less prominent actions",...r.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'outline',
    children: 'Outline Button'
  }
}`,...a.parameters?.docs?.source},description:{story:"Outline button - Tertiary actions",...a.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'ghost',
    children: 'Ghost Button'
  }
}`,...s.parameters?.docs?.source},description:{story:"Ghost button - Minimal styling",...s.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'destructive',
    children: 'Delete'
  }
}`,...o.parameters?.docs?.source},description:{story:"Destructive button - Dangerous or destructive actions",...o.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm',
    children: 'Small Button'
  }
}`,...n.parameters?.docs?.source},description:{story:"Small button",...n.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md',
    children: 'Medium Button'
  }
}`,...i.parameters?.docs?.source},description:{story:"Medium button (default)",...i.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'lg',
    children: 'Large Button'
  }
}`,...c.parameters?.docs?.source},description:{story:"Large button",...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'xl',
    children: 'Extra Large Button'
  }
}`,...d.parameters?.docs?.source},description:{story:"Extra large button",...d.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    isLoading: true,
    children: 'Click me'
  }
}`,...l.parameters?.docs?.source},description:{story:"Loading state",...l.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    children: 'Disabled Button'
  }
}`,...m.parameters?.docs?.source},description:{story:"Disabled state",...m.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Download',
    leftIcon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 12L3 7L4.4 5.6L7 8.2V0H9V8.2L11.6 5.6L13 7L8 12Z" fill="currentColor" />
        <path d="M0 14H16V16H0V14Z" fill="currentColor" />
      </svg>
  }
}`,...u.parameters?.docs?.source},description:{story:"Button with left icon",...u.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Continue',
    rightIcon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 0L13 5L11.6 6.4L9 3.8V16H7V3.8L4.4 6.4L3 5L8 0Z" fill="currentColor" transform="rotate(90 8 8)" />
      </svg>
  }
}`,...p.parameters?.docs?.source},description:{story:"Button with right icon",...p.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Default'
  },
  render: () => <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
      <div className="flex gap-4">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
        <Button size="xl">Extra Large</Button>
      </div>
      <div className="flex gap-4">
        <Button isLoading>Loading</Button>
        <Button disabled>Disabled</Button>
      </div>
    </div>
}`,...g.parameters?.docs?.source},description:{story:"All variants showcase",...g.parameters?.docs?.description}}};const L=["Primary","Secondary","Outline","Ghost","Destructive","Small","Medium","Large","ExtraLarge","Loading","Disabled","WithLeftIcon","WithRightIcon","AllVariants"];export{g as AllVariants,o as Destructive,m as Disabled,d as ExtraLarge,s as Ghost,c as Large,l as Loading,i as Medium,a as Outline,t as Primary,r as Secondary,n as Small,u as WithLeftIcon,p as WithRightIcon,L as __namedExportsOrder,B as default};
