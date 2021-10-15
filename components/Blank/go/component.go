package Blank

import (
	"fmt"
	"html/template"
)


type Instance struct {
}

func New() Instance {
	return Instance{}
}

func (i Instance) Html() template.HTML {
	return template.HTML(fmt.Sprintf(`<zn-blank></zn-blank>`))
}
