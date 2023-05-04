from marshmallow import Schema, fields, validate


# "This class defines the input schema for the CreateSignup mutation. It requires a username, email,
# and password. The username must be at least 4 characters long, and the password must be at least 6
# characters long."
#
# The input schema is used to validate the input data before it is passed to the mutation
class CreateDeployAppInputSchema(Schema):
    # the 'required' argument ensures the field exists
    baseAppId = fields.Int(required=True)
    baseAppName = fields.Str(required=True, validate=validate.Length(min=1))
    developer = fields.Str(required=True, validate=validate.Length(min=1))
    location = fields.Str(required=True, validate=validate.Length(min=1))
    userEmail = fields.Str(required=True, validate=validate.Email())
