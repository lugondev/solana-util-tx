'use client'

import { useState, useMemo } from 'react'
import { CheckCircle, XCircle, AlertCircle, Upload, Download, Code, Settings, Play, FileText } from 'lucide-react'

interface ValidationError {
  path: string
  message: string
  expected?: string
  actual?: string
  severity: 'error' | 'warning' | 'info'
}

interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  schema: any
  data: any
  validationTime: number
}

interface SchemaTemplate {
  id: string
  name: string
  description: string
  type: 'json' | 'borsh' | 'custom'
  schema: string
  example: string
}

const schemaTemplates: SchemaTemplate[] = [
  {
    id: 'json-basic',
    name: 'Basic JSON Schema',
    description: 'Simple object validation with required fields',
    type: 'json',
    schema: `{
  "$schema": "https://json-schema.org/draft/2019-09/schema",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1
    },
    "age": {
      "type": "number",
      "minimum": 0,
      "maximum": 150
    },
    "email": {
      "type": "string",
      "format": "email"
    }
  },
  "required": ["name", "age"]
}`,
    example: `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com"
}`
  },
  {
    id: 'solana-account',
    name: 'Solana Account Data',
    description: 'Schema for validating Solana account structures',
    type: 'json',
    schema: `{
  "$schema": "https://json-schema.org/draft/2019-09/schema",
  "type": "object",
  "properties": {
    "pubkey": {
      "type": "string",
      "pattern": "^[1-9A-HJ-NP-Za-km-z]{32,44}$"
    },
    "lamports": {
      "type": "number",
      "minimum": 0
    },
    "owner": {
      "type": "string",
      "pattern": "^[1-9A-HJ-NP-Za-km-z]{32,44}$"
    },
    "executable": {
      "type": "boolean"
    },
    "data": {
      "type": "array",
      "items": {
        "type": "number",
        "minimum": 0,
        "maximum": 255
      }
    }
  },
  "required": ["pubkey", "lamports", "owner", "executable", "data"]
}`,
    example: `{
  "pubkey": "11111111111111111111111111111112",
  "lamports": 1000000,
  "owner": "11111111111111111111111111111111",
  "executable": false,
  "data": [1, 2, 3, 4, 5]
}`
  },
  {
    id: 'borsh-struct',
    name: 'Borsh Struct Schema',
    description: 'Schema for Borsh serialized data structures',
    type: 'borsh',
    schema: `{
  "type": "struct",
  "fields": [
    {
      "name": "discriminator",
      "type": "u8"
    },
    {
      "name": "amount",
      "type": "u64"
    },
    {
      "name": "recipient",
      "type": "pubkey"
    },
    {
      "name": "memo",
      "type": "string"
    }
  ]
}`,
    example: `{
  "discriminator": 1,
  "amount": 1000000000,
  "recipient": "11111111111111111111111111111112",
  "memo": "Transfer memo"
}`
  },
  {
    id: 'anchor-instruction',
    name: 'Anchor Instruction',
    description: 'Schema for Anchor program instruction data',
    type: 'custom',
    schema: `{
  "type": "instruction",
  "name": "Transfer",
  "accounts": [
    {
      "name": "from",
      "isMut": true,
      "isSigner": true
    },
    {
      "name": "to",
      "isMut": true,
      "isSigner": false
    },
    {
      "name": "systemProgram",
      "isMut": false,
      "isSigner": false
    }
  ],
  "args": [
    {
      "name": "amount",
      "type": "u64"
    }
  ]
}`,
    example: `{
  "instruction": "Transfer",
  "accounts": {
    "from": "11111111111111111111111111111111",
    "to": "11111111111111111111111111111112",
    "systemProgram": "11111111111111111111111111111111"
  },
  "args": {
    "amount": 1000000000
  }
}`
  }
]

export default function SchemaValidator() {
  const [schemaType, setSchemaType] = useState<'json' | 'borsh' | 'custom'>('json')
  const [schemaInput, setSchemaInput] = useState('')
  const [dataInput, setDataInput] = useState('')
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [batchMode, setBatchMode] = useState(false)
  const [customRules, setCustomRules] = useState('')

  const availableTemplates = useMemo(() => {
    return schemaTemplates.filter(template => 
      schemaType === 'json' || template.type === schemaType
    )
  }, [schemaType])

  const loadTemplate = (templateId: string) => {
    const template = schemaTemplates.find(t => t.id === templateId)
    if (template) {
      setSchemaInput(template.schema)
      setDataInput(template.example)
      setSelectedTemplate(templateId)
    }
  }

  const validateJsonSchema = (schema: any, data: any): ValidationError[] => {
    const errors: ValidationError[] = []

    const validateValue = (value: any, schemaProperty: any, path: string) => {
      if (schemaProperty.type) {
        const expectedType = schemaProperty.type
        const actualType = Array.isArray(value) ? 'array' : typeof value
        
        if (expectedType !== actualType) {
          errors.push({
            path,
            message: `Type mismatch`,
            expected: expectedType,
            actual: actualType,
            severity: 'error'
          })
          return
        }
      }

      // String validations
      if (schemaProperty.type === 'string') {
        if (schemaProperty.minLength && value.length < schemaProperty.minLength) {
          errors.push({
            path,
            message: `String too short`,
            expected: `min length ${schemaProperty.minLength}`,
            actual: `length ${value.length}`,
            severity: 'error'
          })
        }
        if (schemaProperty.maxLength && value.length > schemaProperty.maxLength) {
          errors.push({
            path,
            message: `String too long`,
            expected: `max length ${schemaProperty.maxLength}`,
            actual: `length ${value.length}`,
            severity: 'error'
          })
        }
        if (schemaProperty.pattern) {
          const regex = new RegExp(schemaProperty.pattern)
          if (!regex.test(value)) {
            errors.push({
              path,
              message: `String does not match pattern`,
              expected: schemaProperty.pattern,
              actual: value,
              severity: 'error'
            })
          }
        }
        if (schemaProperty.format === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(value)) {
            errors.push({
              path,
              message: `Invalid email format`,
              expected: 'valid email',
              actual: value,
              severity: 'error'
            })
          }
        }
      }

      // Number validations
      if (schemaProperty.type === 'number') {
        if (schemaProperty.minimum !== undefined && value < schemaProperty.minimum) {
          errors.push({
            path,
            message: `Number too small`,
            expected: `minimum ${schemaProperty.minimum}`,
            actual: value.toString(),
            severity: 'error'
          })
        }
        if (schemaProperty.maximum !== undefined && value > schemaProperty.maximum) {
          errors.push({
            path,
            message: `Number too large`,
            expected: `maximum ${schemaProperty.maximum}`,
            actual: value.toString(),
            severity: 'error'
          })
        }
      }

      // Array validations
      if (schemaProperty.type === 'array' && Array.isArray(value)) {
        if (schemaProperty.minItems && value.length < schemaProperty.minItems) {
          errors.push({
            path,
            message: `Array too short`,
            expected: `min ${schemaProperty.minItems} items`,
            actual: `${value.length} items`,
            severity: 'error'
          })
        }
        if (schemaProperty.maxItems && value.length > schemaProperty.maxItems) {
          errors.push({
            path,
            message: `Array too long`,
            expected: `max ${schemaProperty.maxItems} items`,
            actual: `${value.length} items`,
            severity: 'error'
          })
        }
        
        if (schemaProperty.items) {
          value.forEach((item, index) => {
            validateValue(item, schemaProperty.items, `${path}[${index}]`)
          })
        }
      }

      // Object validations
      if (schemaProperty.type === 'object' && typeof value === 'object') {
        if (schemaProperty.properties) {
          Object.keys(schemaProperty.properties).forEach(prop => {
            if (value.hasOwnProperty(prop)) {
              validateValue(value[prop], schemaProperty.properties[prop], `${path}.${prop}`)
            }
          })
        }
      }
    }

    // Check required fields
    if (schema.required && Array.isArray(schema.required)) {
      schema.required.forEach((field: string) => {
        if (!data.hasOwnProperty(field)) {
          errors.push({
            path: field,
            message: `Required field missing`,
            expected: `field '${field}'`,
            actual: 'undefined',
            severity: 'error'
          })
        }
      })
    }

    // Validate properties
    if (schema.properties) {
      Object.keys(data).forEach(key => {
        if (schema.properties[key]) {
          validateValue(data[key], schema.properties[key], key)
        } else {
          errors.push({
            path: key,
            message: `Unexpected field`,
            expected: 'defined in schema',
            actual: key,
            severity: 'warning'
          })
        }
      })
    }

    return errors
  }

  const validateBorshSchema = (schema: any, data: any): ValidationError[] => {
    const errors: ValidationError[] = []

    if (schema.type === 'struct' && schema.fields) {
      schema.fields.forEach((field: any) => {
        if (!data.hasOwnProperty(field.name)) {
          errors.push({
            path: field.name,
            message: `Required field missing`,
            expected: `field '${field.name}' of type '${field.type}'`,
            actual: 'undefined',
            severity: 'error'
          })
          return
        }

        const value = data[field.name]
        const fieldType = field.type

        // Type checking for Borsh types
        switch (fieldType) {
          case 'u8':
          case 'u16':
          case 'u32':
          case 'u64':
          case 'i8':
          case 'i16':
          case 'i32':
          case 'i64':
            if (typeof value !== 'number' || !Number.isInteger(value)) {
              errors.push({
                path: field.name,
                message: `Invalid integer type`,
                expected: fieldType,
                actual: typeof value,
                severity: 'error'
              })
            }
            break
          
          case 'string':
            if (typeof value !== 'string') {
              errors.push({
                path: field.name,
                message: `Invalid string type`,
                expected: 'string',
                actual: typeof value,
                severity: 'error'
              })
            }
            break
          
          case 'pubkey':
            if (typeof value !== 'string' || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value)) {
              errors.push({
                path: field.name,
                message: `Invalid pubkey format`,
                expected: 'valid base58 pubkey',
                actual: value,
                severity: 'error'
              })
            }
            break
        }
      })
    }

    return errors
  }

  const validateCustomSchema = (schema: any, data: any): ValidationError[] => {
    const errors: ValidationError[] = []

    if (schema.type === 'instruction') {
      // Validate instruction structure
      if (!data.instruction) {
        errors.push({
          path: 'instruction',
          message: 'Instruction name missing',
          expected: 'instruction name',
          actual: 'undefined',
          severity: 'error'
        })
      } else if (data.instruction !== schema.name) {
        errors.push({
          path: 'instruction',
          message: 'Instruction name mismatch',
          expected: schema.name,
          actual: data.instruction,
          severity: 'error'
        })
      }

      // Validate accounts
      if (schema.accounts) {
        schema.accounts.forEach((account: any) => {
          if (!data.accounts || !data.accounts[account.name]) {
            errors.push({
              path: `accounts.${account.name}`,
              message: 'Required account missing',
              expected: `account '${account.name}'`,
              actual: 'undefined',
              severity: 'error'
            })
          }
        })
      }

      // Validate args
      if (schema.args) {
        schema.args.forEach((arg: any) => {
          if (!data.args || data.args[arg.name] === undefined) {
            errors.push({
              path: `args.${arg.name}`,
              message: 'Required argument missing',
              expected: `argument '${arg.name}' of type '${arg.type}'`,
              actual: 'undefined',
              severity: 'error'
            })
          }
        })
      }
    }

    return errors
  }

  const runValidation = async () => {
    setIsValidating(true)
    const startTime = Date.now()

    try {
      const schema = JSON.parse(schemaInput)
      const dataItems = batchMode 
        ? dataInput.split('\n').filter(line => line.trim()).map(line => JSON.parse(line))
        : [JSON.parse(dataInput)]

      const results: ValidationResult[] = []

      for (const data of dataItems) {
        let errors: ValidationError[] = []

        switch (schemaType) {
          case 'json':
            errors = validateJsonSchema(schema, data)
            break
          case 'borsh':
            errors = validateBorshSchema(schema, data)
            break
          case 'custom':
            errors = validateCustomSchema(schema, data)
            break
        }

        // Apply custom rules if provided
        if (customRules) {
          try {
            const rules = JSON.parse(customRules)
            // Simple custom rule evaluation (can be extended)
            if (rules.maxSize && JSON.stringify(data).length > rules.maxSize) {
              errors.push({
                path: '_root',
                message: 'Data exceeds maximum size',
                expected: `max ${rules.maxSize} bytes`,
                actual: `${JSON.stringify(data).length} bytes`,
                severity: 'warning'
              })
            }
          } catch (e) {
            console.warn('Invalid custom rules:', e)
          }
        }

        const warnings = errors.filter(e => e.severity === 'warning')
        const actualErrors = errors.filter(e => e.severity === 'error')

        results.push({
          isValid: actualErrors.length === 0,
          errors: actualErrors,
          warnings,
          schema,
          data,
          validationTime: Date.now() - startTime
        })
      }

      setValidationResults(results)
    } catch (error) {
      setValidationResults([{
        isValid: false,
        errors: [{
          path: '_parse',
          message: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          expected: 'valid JSON',
          actual: 'invalid syntax',
          severity: 'error'
        }],
        warnings: [],
        schema: null,
        data: null,
        validationTime: Date.now() - startTime
      }])
    } finally {
      setIsValidating(false)
    }
  }

  const exportResults = () => {
    const report = {
      timestamp: new Date().toISOString(),
      schemaType,
      totalValidated: validationResults.length,
      validCount: validationResults.filter(r => r.isValid).length,
      results: validationResults.map(result => ({
        isValid: result.isValid,
        errorCount: result.errors.length,
        warningCount: result.warnings.length,
        errors: result.errors,
        warnings: result.warnings,
        validationTime: result.validationTime
      }))
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `validation_report_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Configuration */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Validation Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Schema Type
            </label>
            <select
              value={schemaType}
              onChange={(e) => setSchemaType(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value="json">JSON Schema</option>
              <option value="borsh">Borsh Schema</option>
              <option value="custom">Custom Schema</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => loadTemplate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value="">Select a template...</option>
              {availableTemplates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={batchMode}
                onChange={(e) => setBatchMode(e.target.checked)}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-300">Batch Mode</span>
            </label>
          </div>
        </div>
      </div>

      {/* Schema and Data Input */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Schema Definition</h3>
          <textarea
            value={schemaInput}
            onChange={(e) => setSchemaInput(e.target.value)}
            placeholder={`Enter your ${schemaType} schema here...`}
            rows={12}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 font-mono text-sm"
          />
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Data to Validate {batchMode && '(One JSON per line)'}
          </h3>
          <textarea
            value={dataInput}
            onChange={(e) => setDataInput(e.target.value)}
            placeholder={batchMode 
              ? "Enter multiple JSON objects, one per line..." 
              : "Enter JSON data to validate..."
            }
            rows={12}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 font-mono text-sm"
          />
        </div>
      </div>

      {/* Custom Rules */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Custom Validation Rules (Optional)</h3>
        <textarea
          value={customRules}
          onChange={(e) => setCustomRules(e.target.value)}
          placeholder='Enter custom rules as JSON: {"maxSize": 1000, "customValidators": [...]}'
          rows={3}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 font-mono text-sm"
        />
      </div>

      {/* Actions */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={runValidation}
              disabled={isValidating || !schemaInput || !dataInput}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>{isValidating ? 'Validating...' : 'Validate'}</span>
            </button>

            {validationResults.length > 0 && (
              <button
                onClick={exportResults}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
            )}
          </div>

          {validationResults.length > 0 && (
            <div className="text-sm text-gray-400">
              Validated {validationResults.length} item(s) in {validationResults[0]?.validationTime}ms
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {validationResults.length > 0 && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-6">Validation Results</h3>
          
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700 p-4 rounded text-center">
              <div className="text-2xl font-bold text-white">{validationResults.length}</div>
              <div className="text-sm text-gray-400">Total Items</div>
            </div>
            <div className="bg-gray-700 p-4 rounded text-center">
              <div className="text-2xl font-bold text-green-400">
                {validationResults.filter(r => r.isValid).length}
              </div>
              <div className="text-sm text-gray-400">Valid</div>
            </div>
            <div className="bg-gray-700 p-4 rounded text-center">
              <div className="text-2xl font-bold text-red-400">
                {validationResults.filter(r => !r.isValid).length}
              </div>
              <div className="text-sm text-gray-400">Invalid</div>
            </div>
            <div className="bg-gray-700 p-4 rounded text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {validationResults.reduce((sum, r) => sum + r.warnings.length, 0)}
              </div>
              <div className="text-sm text-gray-400">Warnings</div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="space-y-4">
            {validationResults.map((result, index) => (
              <div key={index} className="bg-gray-700 p-4 rounded border border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {result.isValid ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="font-medium text-white">
                      Item {index + 1} - {result.isValid ? 'Valid' : 'Invalid'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {result.errors.length} errors, {result.warnings.length} warnings
                  </div>
                </div>

                {(result.errors.length > 0 || result.warnings.length > 0) && (
                  <div className="space-y-2">
                    {result.errors.map((error, errorIndex) => (
                      <div key={errorIndex} className="flex items-start space-x-2 text-sm">
                        <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-red-400 font-medium">{error.path}</div>
                          <div className="text-gray-300">{error.message}</div>
                          {error.expected && (
                            <div className="text-gray-400">
                              Expected: {error.expected}, Got: {error.actual}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {result.warnings.map((warning, warningIndex) => (
                      <div key={warningIndex} className="flex items-start space-x-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-yellow-400 font-medium">{warning.path}</div>
                          <div className="text-gray-300">{warning.message}</div>
                          {warning.expected && (
                            <div className="text-gray-400">
                              Expected: {warning.expected}, Got: {warning.actual}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}