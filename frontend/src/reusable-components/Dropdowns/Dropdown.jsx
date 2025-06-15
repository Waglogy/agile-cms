/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import { useController } from 'react-hook-form'

import Error from '../outputs/Error'

export default function Dropdown({
  defaultName,
  labelname,
  required,
  pattern,
  errors,
  classes,
  setError,
  clearError,
  onChangeInput,
  control,
  data,
  showInput,
  maxMenuHeight,
  ...rest
}) {
  const {
    field: { onChange, onBlur, name, value, ref },
  } = useController({
    name: defaultName,
    control,
    rules: { required: required, pattern: pattern },
    defaultValue: rest?.defaultValue,
  })

  useEffect(() => {
    if (rest?.defaultValue !== '') {
      if (rest.setSelected) {
        rest.setSelected(rest?.defaultValue)
      }
      if (rest.setValue) {
        rest.setValue(defaultName, rest?.defaultValue, { shouldTouch: true })
      }
    }
  }, [rest?.defaultValue, defaultName, rest.setSelected, rest.setValue])

  return (
    <div
      className={`${
        showInput === undefined || showInput === true
          ? 'flex flex-col'
          : 'hidden'
      } w-full my-2 justify-start text-left items-start`}
    >
      <label className="font-medium text-left text-gray-900 pl-1 pb-1 text-xs md:text-sm lg:text-base">
        {labelname} {required && <span className="text-red-700">*</span>}
      </label>
      <Select
        theme={(theme) => ({
          ...theme,
          borderRadius: 0,
          borderWidth: '1px',
          colors: {
            ...theme.colors,
            // primary25: "#F1F1F1",
            primary25: '#D3D3D3', //Options background color
            primary: '#000000', //Border color on focus
          },
        })}
        styles={{
          control: (base, state) => ({
            ...base,
            borderWidth: '2px', // Set the border width
            borderColor: state.isFocused ? '#000000' : '#CCCCCC', // Dynamic border color
            boxShadow: state.isFocused ? '0 0 0 0px #000000' : 'none', // Remove the default focus ring
            // "&:hover": {
            //   borderColor: "#000000", // Border color on hover
            // },
          }),
        }}
        // maxMenuHeight={maxMenuHeight}
        isClearable={true}
        options={data}
        name={name}
        value={rest.selected}
        inputRef={ref}
        isMulti={rest.isMulti}
        closeMenuOnSelect={rest.closeMenuOnSelect}
        {...rest}
        className={`text-black text-xs md:text-sm  ${classes} ${
          errors[defaultName] ? 'border rounded-none border-red-600' : ''
        }`}
        onChange={(e) => {
          // console.log(e);
          // rest.setValue(defaultName, e, { shouldTouch: true });
          rest.setSelected(e)
          onChange(e)
          // console.log("onchanged called", e);
          if (required) {
            if (e === null) {
              setError(defaultName, {
                type: 'required',
                message: `${labelname} is required`,
              })
              if (onChangeInput !== null) {
                onChangeInput(null)
              }
            } else if (onChangeInput !== null) {
              onChangeInput(e.value)
              clearError(defaultName)
            } else {
              clearError(defaultName)
            }
          }
          if (!required) {
            if (onChangeInput !== null) {
              // console.log(e);
              onChangeInput(e.value)
              clearError(defaultName)
            } else {
              clearError(defaultName)
            }
          }
        }}
        onBlur={onBlur}
        // value={value}
      />
      {errors[defaultName] && (
        <Error
          classes="flex flex-row gap-1 justify-start items-center max-w-sm w-full mt-1"
          message={`${labelname} is required`}
        />
      )}
    </div>
  )
}
