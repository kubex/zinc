package Icon

import (
	"fmt"
	"html/template"
)

type Library string

const (
	LibraryMaterial         Library = "material"
	LibraryMaterialOutlined Library = "material.outlined"
	LibraryMaterialRound    Library = "material.round"
	LibraryMaterialSharp    Library = "material.sharp"
	LibraryMaterialTwoTone  Library = "material.two-tone"
	LibraryGravatar         Library = "gravatar"
)

type Size int

const (
	Size16  Size = 16
	Size24  Size = 24
	Size32  Size = 32
	Size40  Size = 40
	Size48  Size = 48
	Size56  Size = 56
	Size64  Size = 64
	Size80  Size = 80
	Size96  Size = 96
	Size120 Size = 120
	Size144 Size = 144
	Size160 Size = 160
	Size200 Size = 200
	Size240 Size = 240
	Size280 Size = 280
	Size320 Size = 320
)

type Instance struct {
	src     string
	library Library
	size    Size
}

func Default(src string) Instance { return New(src, LibraryMaterialOutlined) }
func New(src string, library Library) Instance {
	return Instance{src: src, library: library, size: Size24}
}

func (i Instance) Size() Size         { return i.size }
func (i *Instance) SetSize(size Size) { i.size = size }

func (i Instance) Html() template.HTML {
	return template.HTML(fmt.Sprintf(`<zn-icon src="%s" library="%s" size="%d"></zn-icon>`, i.src, i.library, i.size))
}
