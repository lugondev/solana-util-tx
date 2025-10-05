'use client'

import { useState } from 'react'
import { Copy, Download, Code, Settings, Plus, Trash2 } from 'lucide-react'

interface Account {
  name: string
  type: string
  isMut: boolean
  isSigner: boolean
  description: string
}

interface InstructionData {
  name: string
  type: string
  description: string
}

interface CpiConfig {
  programId: string
  instructionName: string
  instructionType: string
  description: string
  accounts: Account[]
  data: InstructionData[]
}

export default function AnchorCpiHelper() {
  const [config, setConfig] = useState<CpiConfig>({
    programId: '',
    instructionName: '',
    instructionType: 'invoke',
    description: '',
    accounts: [],
    data: []
  })

  const [generatedCode, setGeneratedCode] = useState('')
  const [activeTab, setActiveTab] = useState<'config' | 'accounts' | 'data' | 'code'>('config')

  const addAccount = () => {
    setConfig(prev => ({
      ...prev,
      accounts: [...prev.accounts, {
        name: '',
        type: 'AccountInfo',
        isMut: false,
        isSigner: false,
        description: ''
      }]
    }))
  }

  const removeAccount = (index: number) => {
    setConfig(prev => ({
      ...prev,
      accounts: prev.accounts.filter((_, i) => i !== index)
    }))
  }

  const updateAccount = (index: number, field: keyof Account, value: any) => {
    setConfig(prev => ({
      ...prev,
      accounts: prev.accounts.map((account, i) => 
        i === index ? { ...account, [field]: value } : account
      )
    }))
  }

  const addData = () => {
    setConfig(prev => ({
      ...prev,
      data: [...prev.data, {
        name: '',
        type: 'u64',
        description: ''
      }]
    }))
  }

  const removeData = (index: number) => {
    setConfig(prev => ({
      ...prev,
      data: prev.data.filter((_, i) => i !== index)
    }))
  }

  const updateData = (index: number, field: keyof InstructionData, value: string) => {
    setConfig(prev => ({
      ...prev,
      data: prev.data.map((data, i) => 
        i === index ? { ...data, [field]: value } : data
      )
    }))
  }

  const generateCode = () => {
    const { programId, instructionName, accounts, data } = config

    // Generate account struct
    const accountStruct = `
#[derive(Accounts)]
pub struct ${instructionName.charAt(0).toUpperCase() + instructionName.slice(1)}Cpi<'info> {
${accounts.map(acc => `    #[account(${acc.isMut ? 'mut' : ''}${acc.isSigner ? ', signer' : ''})]
    pub ${acc.name}: ${acc.type}<'info>,`).join('\n')}
}`;

    // Generate instruction data struct
    const dataStruct = data.length > 0 ? `
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ${instructionName.charAt(0).toUpperCase() + instructionName.slice(1)}Data {
${data.map(d => `    pub ${d.name}: ${d.type},`).join('\n')}
}` : '';

    // Generate CPI function
    const cpiFunction = `
pub fn ${instructionName}_cpi(
    ctx: CpiContext<${instructionName.charAt(0).toUpperCase() + instructionName.slice(1)}Cpi>,
${data.map(d => `    ${d.name}: ${d.type},`).join('\n')}
) -> Result<()> {
    let instruction_data = ${data.length > 0 ? `${instructionName.charAt(0).toUpperCase() + instructionName.slice(1)}Data {
${data.map(d => `        ${d.name},`).join('\n')}
    }` : 'vec![]'};

    let accounts = vec![
${accounts.map(acc => `        AccountMeta::new${acc.isMut ? '' : '_readonly'}(ctx.accounts.${acc.name}.key(), ${acc.isSigner}),`).join('\n')}
    ];

    let instruction = Instruction {
        program_id: *ctx.program.key,
        accounts,
        data: instruction_data.try_to_vec()?,
    };

    invoke(
        &instruction,
        &[
${accounts.map(acc => `            ctx.accounts.${acc.name}.to_account_info(),`).join('\n')}
        ],
    )?;

    Ok(())
}`;

    // Generate TypeScript types
    const tsTypes = `
// TypeScript types
export interface ${instructionName.charAt(0).toUpperCase() + instructionName.slice(1)}Accounts {
${accounts.map(acc => `  ${acc.name}: PublicKey; // ${acc.description}`).join('\n')}
}

export interface ${instructionName.charAt(0).toUpperCase() + instructionName.slice(1)}Data {
${data.map(d => `  ${d.name}: ${d.type === 'u64' ? 'number' : d.type === 'String' ? 'string' : d.type}; // ${d.description}`).join('\n')}
}`;

    const fullCode = `// Generated Anchor CPI Code for ${instructionName}
// Program ID: ${programId}

use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    instruction::{AccountMeta, Instruction},
    program::invoke,
};

${accountStruct}
${dataStruct}
${cpiFunction}

${tsTypes}`;

    setGeneratedCode(fullCode)
    setActiveTab('code')
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedCode)
  }

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${config.instructionName}_cpi.rs`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'config', label: 'Configuration', icon: Settings },
          { id: 'accounts', label: 'Accounts', icon: Code },
          { id: 'data', label: 'Instruction Data', icon: Code },
          { id: 'code', label: 'Generated Code', icon: Code }
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-6">Program Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Program ID
              </label>
              <input
                type="text"
                value={config.programId}
                onChange={(e) => setConfig(prev => ({ ...prev, programId: e.target.value }))}
                placeholder="Enter program ID (e.g., 11111111111111111111111111111112)"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Instruction Name
              </label>
              <input
                type="text"
                value={config.instructionName}
                onChange={(e) => setConfig(prev => ({ ...prev, instructionName: e.target.value }))}
                placeholder="Enter instruction name (e.g., transfer)"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Instruction Type
              </label>
              <select
                value={config.instructionType}
                onChange={(e) => setConfig(prev => ({ ...prev, instructionType: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
              >
                <option value="invoke">invoke</option>
                <option value="invoke_signed">invoke_signed</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={config.description}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter instruction description..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Accounts Tab */}
      {activeTab === 'accounts' && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Account Configuration</h3>
            <button
              onClick={addAccount}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Account</span>
            </button>
          </div>

          <div className="space-y-4">
            {config.accounts.map((account, index) => (
              <div key={index} className="bg-gray-700 p-4 rounded border border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-white">Account {index + 1}</h4>
                  <button
                    onClick={() => removeAccount(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={account.name}
                      onChange={(e) => updateAccount(index, 'name', e.target.value)}
                      placeholder="Account name"
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                    <select
                      value={account.type}
                      onChange={(e) => updateAccount(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                    >
                      <option value="AccountInfo">AccountInfo</option>
                      <option value="Account">Account</option>
                      <option value="Program">Program</option>
                      <option value="SystemAccount">SystemAccount</option>
                      <option value="Signer">Signer</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={account.isMut}
                        onChange={(e) => updateAccount(index, 'isMut', e.target.checked)}
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-300">Mutable</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={account.isSigner}
                        onChange={(e) => updateAccount(index, 'isSigner', e.target.checked)}
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-300">Signer</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <input
                      type="text"
                      value={account.description}
                      onChange={(e) => updateAccount(index, 'description', e.target.value)}
                      placeholder="Account description"
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}

            {config.accounts.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No accounts configured. Click "Add Account" to get started.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instruction Data Tab */}
      {activeTab === 'data' && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Instruction Data</h3>
            <button
              onClick={addData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Data Field</span>
            </button>
          </div>

          <div className="space-y-4">
            {config.data.map((data, index) => (
              <div key={index} className="bg-gray-700 p-4 rounded border border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-white">Data Field {index + 1}</h4>
                  <button
                    onClick={() => removeData(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Field Name</label>
                    <input
                      type="text"
                      value={data.name}
                      onChange={(e) => updateData(index, 'name', e.target.value)}
                      placeholder="Field name"
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                    <select
                      value={data.type}
                      onChange={(e) => updateData(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                    >
                      <option value="u64">u64</option>
                      <option value="u32">u32</option>
                      <option value="u16">u16</option>
                      <option value="u8">u8</option>
                      <option value="i64">i64</option>
                      <option value="i32">i32</option>
                      <option value="i16">i16</option>
                      <option value="i8">i8</option>
                      <option value="String">String</option>
                      <option value="Pubkey">Pubkey</option>
                      <option value="bool">bool</option>
                      <option value="Vec<u8>">Vec&lt;u8&gt;</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <input
                      type="text"
                      value={data.description}
                      onChange={(e) => updateData(index, 'description', e.target.value)}
                      placeholder="Field description"
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}

            {config.data.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No data fields configured. Click "Add Data Field" to get started.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generated Code Tab */}
      {activeTab === 'code' && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Generated Code</h3>
            <div className="flex space-x-2">
              <button
                onClick={generateCode}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              >
                <Code className="w-4 h-4" />
                <span>Generate</span>
              </button>
              {generatedCode && (
                <>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={downloadCode}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {generatedCode ? (
            <div className="bg-gray-900 p-4 rounded border border-gray-600 overflow-x-auto">
              <pre className="text-gray-300 text-sm whitespace-pre-wrap">
                {generatedCode}
              </pre>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              Configure your program details and click "Generate" to create CPI code.
            </div>
          )}
        </div>
      )}
    </div>
  )
}