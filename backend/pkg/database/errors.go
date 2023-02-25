package database

type NotExists struct{}

func (e *NotExists) Error() string {
	return "item does not exist"
}
