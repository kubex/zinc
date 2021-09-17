package MaxWidth

import (
	"fmt"
	"html/template"
)

type Instance struct {
	size int32
}

func New() Instance {
	return Instance{}
}
func Defined(size int32) Instance {
	return Instance{size: size}
}

func (i Instance) Size() int32         { return i.size }
func (i *Instance) SetSize(size int32) { i.size = size }

func (i Instance) Html() template.HTML {
	return template.HTML(fmt.Sprintf(`<fusion-max-width width="%d"></fusion-max-width>`, i.size))
}
