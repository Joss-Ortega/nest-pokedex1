import { BadRequestException, Injectable, InternalServerErrorException, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {


  constructor(
@InjectModel(Pokemon.name)
private readonly pokemonModel:Model<Pokemon>

  ){}
  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name=createPokemonDto.name.toLocaleLowerCase();

    try{  

    const pokemon= await this.pokemonModel.create(createPokemonDto);
    return pokemon;
    
  }catch(error){
    this.handleExeptions(error);
  }
   
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {

  let pokemon:Pokemon;
  

  if(!isNaN(+term)){

    pokemon=await this.pokemonModel.findOne({no:term});
  }
  // METODO DE BUSQUEDA DE ID PROPIO DE MONGO
  if(!pokemon && isValidObjectId(term))
  {

pokemon=await this.pokemonModel.findById(term);

  }

  if(!pokemon){

    pokemon= await this.pokemonModel.findOne({name: term.toLocaleLowerCase()})
  }

  if(!pokemon)
  throw new NotFoundException(`Pokemon with id, name or no "${term}" not found`);



    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
   
   const pokemon= await this.findOne(term);

   if(updatePokemonDto.name)
   updatePokemonDto.name= updatePokemonDto.name.toLocaleLowerCase();


   try{

   await pokemon.updateOne(updatePokemonDto);
   return {...pokemon.toJSON(), ...UpdatePokemonDto};

  }catch(error){
    

  this.handleExeptions(error);
      
    }

  


  }
  
  

  async remove(id: string) {

    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id});

    if(deletedCount === 0)
    throw new BadRequestException (`Pokemon with id "${id}" not found `);



    // const result = await this.pokemonModel.findByIdAndDelete(id);
    return;
  }




  private handleExeptions(error:any){

    if(error.code === 11000){
      throw new BadRequestException( `Pokemon exists in db ${JSON.stringify(error.keyValue)}`);

    }

    console.log(error);
    throw new InternalServerErrorException(`CANT CREATE POKEMON - CHECK SERVER LOGS `);
  }
}